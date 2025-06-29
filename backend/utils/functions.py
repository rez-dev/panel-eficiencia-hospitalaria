import numpy as np
import pandas as pd
from pysfa import SFA
from Pyfrontier.frontier_model import EnvelopDEA
from typing import List, Tuple, Dict
from joblib import Parallel, delayed
import pandas as pd
import numpy as np
import statsmodels.api as sm
from typing import List, Tuple, Dict

def calculate_sfa_metrics(df: pd.DataFrame,
                          input_cols: list[str],
                          output_col: list[str],
                          te_threshold: float = 0.6,
                          fun: str = SFA.FUN_PROD,
                          method: str = SFA.TE_teJ) -> tuple[pd.DataFrame, dict]:
    """
    Ejecuta SFA sobre df y devuelve:
      - df_out: df con columna 'Eff_SFA'
      - metrics: diccionario con KPI y parámetros clave
    
    Parámetros:
    -----------
    df : DataFrame
      Datos con insumos y output.
    input_cols : lista de str
      Nombres de columnas de insumos.
    output_col : str
      Nombre de la columna de output.
    te_threshold : float
      Umbral para definir 'hospital crítico' (TE < te_threshold).
    fun : str
      Función a usar (SFA.FUN_PROD o FUN_COST).
    method : str
      Método de eficiencia (SFA.TE_teJ, TE_te, TE_teMod).
    """
    # 1) Si output_col es una lista, tomar solo el primer elemento
    if isinstance(output_col, list):
        if len(output_col) == 0:
            raise ValueError("output_col no puede estar vacío")
        output_col_name = output_col[0]
    else:
        output_col_name = output_col
    
    # 2) CREAR MÁSCARA de hospitales válidos (inputs y outputs > 0)
    mask_validos = (df[input_cols] > 0).all(axis=1) & (df[output_col_name] > 0)
    
    # 3) SEPARAR hospitales válidos e inválidos
    df_validos = df[mask_validos].copy()
    df_invalidos = df[~mask_validos].copy()
    
    # print(f"Hospitales válidos: {len(df_validos)}")
    # print(f"Hospitales inválidos (ET SFA = 0): {len(df_invalidos)}")
    
    # 4) EJECUTAR SFA solo en hospitales válidos
    if len(df_validos) > 0:
        x = np.log(df_validos[input_cols]).to_numpy()
        y = np.log(df_validos[output_col_name]).to_numpy()

        sfa = SFA.SFA(y, x, fun=fun, method=method)
        sfa.optimize()
        
        # Extraer eficiencia
        te = np.array(sfa.get_technical_efficiency())
        df_validos['ET SFA'] = te
        
        # Extraer parámetros
        all_betas = np.array(sfa.get_beta())
        all_pvals = np.array(sfa.get_pvalue())
        lambda_varianza = sfa.get_lambda()
        
        # Calcular métricas solo de hospitales válidos
        et_promedio = float(te.mean())
        pct_crit = float((te < te_threshold).mean() * 100)
        
        # Determinar variable clave
        k = len(input_cols)
        betas_in = all_betas[1:1+k]
        pvals_in = all_pvals[1:1+k]
        df_coef = pd.DataFrame({
            'input': input_cols,
            'beta': betas_in,
            'p_value': pvals_in
        })
        df_sign = df_coef[df_coef.p_value < 0.05].copy()
        if not df_sign.empty:
            df_sign['abs_beta'] = df_sign.beta.abs()
            var_clave = df_sign.sort_values('abs_beta', ascending=False).iloc[0].input
        else:
            var_clave = "No determinada"
        
        # Calcular percentiles solo de hospitales válidos
        df_validos['percentil'] = pd.qcut(df_validos['ET SFA'], 100, labels=False, duplicates='drop') + 1
        
    else:
        # No hay hospitales válidos
        et_promedio = 0.0
        pct_crit = 100.0
        var_clave = "No determinada"
        lambda_varianza = 0.0
    
    # 5) ASIGNAR ET SFA = 0 a hospitales inválidos
    if len(df_invalidos) > 0:
        df_invalidos['ET SFA'] = 0.0
        df_invalidos['percentil'] = 0  # Percentil 0 para inválidos
    
    # 6) COMBINAR ambos DataFrames
    df_out = pd.concat([df_validos, df_invalidos], ignore_index=True)
    
    # 7) RECALCULAR métricas incluyendo hospitales con ET SFA = 0
    te_total = df_out['ET SFA'].values
    et_promedio_total = float(te_total.mean())
    pct_crit_total = float((te_total < te_threshold).mean() * 100)
    
    # Empaquetar métricas
    metrics = {        'et_promedio': et_promedio_total,      # Promedio incluyendo 0s
        'pct_criticos': pct_crit_total,        # % críticos incluyendo 0s
        'variable_clave': var_clave,
        'varianza': float(lambda_varianza)
    }
    return df_out, metrics


def calculate_dea_metrics(df: pd.DataFrame,
                          input_cols: list[str],
                          output_cols: list[str],
                          orientation: str = "in",
                          rts: str = "CRS",
                          te_threshold: float = 0.6,
                          n_jobs: int = 1
                         ) -> tuple[pd.DataFrame, dict]:
    """
    Ejecuta un DEA y devuelve:
      - df_out: df con columna 'ET DEA' (0 para hospitales que no cumplen filtros)
      - metrics: diccionario con KPI y parámetros clave
    
    Parámetros:
      df           : DataFrame con tus datos
      input_cols   : lista de nombres de columnas de insumos
      output_cols  : lista de nombres de columnas de outputs
      orientation  : 'in' o 'out'
      rts          : 'CRS' o 'VRS'
      te_threshold : umbral para % críticos (score < te_threshold)
    """
    
    # 1) CREAR MÁSCARA de hospitales válidos (inputs y outputs > 0)
    mask_validos = (df[input_cols] > 0).all(axis=1) & (df[output_cols] > 0).all(axis=1)
    
    # 2) SEPARAR hospitales válidos e inválidos
    df_validos = df[mask_validos].copy()
    df_invalidos = df[~mask_validos].copy()
    
    # print(f"Hospitales válidos: {len(df_validos)}")
    # print(f"Hospitales inválidos (ET DEA = 0): {len(df_invalidos)}")
    
    # 3) EJECUTAR DEA solo en hospitales válidos
    if len(df_validos) > 0:
        # Armar arrays
        x = df_validos[input_cols].to_numpy()
        y = df_validos[output_cols].to_numpy()
        
        # Entrenar DEA
        dea_crs = EnvelopDEA(rts, orientation, n_jobs=n_jobs)
        dea_crs.fit(x, y)
        
        # Scores y slacks
        scores_crs = np.array([res.score for res in dea_crs.result])
        slacks_crs = np.stack([res.x_slack for res in dea_crs.result], axis=0)  # shape (n, k)
        
        # Asignar scores a hospitales válidos
        df_validos["ET DEA"] = scores_crs
        
        # KPI: promedio y críticos (solo de hospitales válidos)
        et_promedio = float(scores_crs.mean())
        pct_crit = float((scores_crs < te_threshold).mean() * 100)
        
        # Variable slack clave: el input cuyo slack medio es mayor
        mean_slacks = np.nanmean(np.where(slacks_crs==0, np.nan, slacks_crs), axis=0)
        if not np.isnan(mean_slacks).all():  # Verificar que hay slacks válidos
            idx_max = int(np.nanargmax(mean_slacks))
            var_slack_clave = input_cols[idx_max]
        else:
            var_slack_clave = "No determinado"
        
        # Calcular percentiles solo de hospitales válidos
        df_validos['percentil'] = pd.qcut(df_validos['ET DEA'], 100, labels=False, duplicates='drop') + 1
        
    else:
        # No hay hospitales válidos
        et_promedio = 0.0
        pct_crit = 100.0
        var_slack_clave = "No determinado"
    
    # 4) ASIGNAR ET DEA = 0 a hospitales inválidos
    if len(df_invalidos) > 0:
        df_invalidos['ET DEA'] = 0.0
        df_invalidos['percentil'] = 0  # Percentil 0 para inválidos
    
    # 5) COMBINAR ambos DataFrames
    df_out = pd.concat([df_validos, df_invalidos], ignore_index=True)
    
    # 6) RECALCULAR métricas incluyendo hospitales con ET DEA = 0
    te_total = df_out['ET DEA'].values
    et_promedio_total = float(te_total.mean())
    pct_crit_total = float((te_total < te_threshold).mean() * 100)
      # 7) Empaquetar métricas
    metrics = {
        "et_promedio": et_promedio_total,           # Promedio incluyendo 0s
        "pct_criticos": pct_crit_total,             # % críticos incluyendo 0s
        "top_slack_promedio": var_slack_clave,
        # "hospitales_validos": len(df_validos),
        # "hospitales_invalidos": len(df_invalidos)
    }
    
    return df_out, metrics

def run_pca(df: pd.DataFrame,
            feature_cols: List[str],
            n_components: int | None = None,
            scale: bool = True
           ) -> Tuple[pd.DataFrame, Dict]:
    """
    Ejecuta PCA sobre las columnas `feature_cols` y devuelve:
      • df_pca  : DataFrame con columnas PC1, PC2, …, PCk
      • metrics : dict con varianza explicada y matriz de cargas
    
    Parámetros
    ----------
    df           : DataFrame original
    feature_cols : columnas a incluir en el PCA (solo numéricas)
    n_components : nº de componentes (None ⇒ tantas como variables)
    scale        : estandarizar variables a media 0 y σ 1 antes de PCA
    """
    X = df[feature_cols].to_numpy(dtype=float)
    
    # Escalado opcional
    if scale:
        from sklearn.preprocessing import StandardScaler
        X = StandardScaler().fit_transform(X)
    
    from sklearn.decomposition import PCA
    pca = PCA(n_components=n_components)
    pcs = pca.fit_transform(X)
    
    pc_cols = [f"PC{i+1}" for i in range(pcs.shape[1])]
    df_pca  = pd.DataFrame(pcs, index=df.index, columns=pc_cols)
    
    metrics = {
        "explained_variance_ratio": pca.explained_variance_ratio_.tolist(),
        "components": pd.DataFrame(pca.components_,
                                   index=pc_cols,
                                   columns=feature_cols)
    }
    return df_pca, metrics

def pca_kmeans(df: pd.DataFrame,
               feature_cols: List[str],
               n_components: int = 2,
               k: int | None = None,
               k_max: int = 10,
               scale: bool = True,
               random_state: int = 42
              ) -> Tuple[pd.DataFrame, Dict]:
    """
    1) Ejecuta PCA con run_pca
    2) Aplica K-means (elige k óptimo con silhouette si k=None)
    3) Devuelve df con PCs y 'cluster', y un diccionario de metadatos
    """
    # ---- PCA --------------------------------------------------
    df_pca, pca_meta = run_pca(df, feature_cols,
                               n_components=n_components,
                               scale=scale)
    pc_cols = df_pca.columns.tolist()

    # ---- elegir k si no viene fijo ---------------------------
    if k is None:
        best_k, best_score = 2, -1
        for kk in range(2, k_max + 1):
            from sklearn.cluster import KMeans
            from sklearn.metrics import silhouette_score
            km = KMeans(n_clusters=kk, n_init="auto", random_state=random_state)
            labels = km.fit_predict(df_pca[pc_cols])
            score = silhouette_score(df_pca[pc_cols], labels)
            if score > best_score:
                best_k, best_score = kk, score
        k = best_k
        silhouette_best = best_score
    else:
        silhouette_best = None

    # ---- K-means definitivo -----------------------------------
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    kmeans = KMeans(n_clusters=k, n_init="auto", random_state=random_state)
    cluster_labels = kmeans.fit_predict(df_pca[pc_cols])

    # calcular silhouette si no se calculó antes
    if silhouette_best is None:
        silhouette_best = silhouette_score(df_pca[pc_cols], cluster_labels)

    # ---- ensamblar DataFrame de salida ------------------------
    df_out = df.copy()
    df_out = pd.concat([df_out, df_pca], axis=1)
    df_out["cluster"] = cluster_labels

    # ---- empaquetar metadatos ---------------------------------
    meta = {
        "explained_variance_ratio": pca_meta["explained_variance_ratio"],
        "components": pca_meta["components"],
        "k": k,
        "silhouette": silhouette_best,
        "cluster_centers": pd.DataFrame(kmeans.cluster_centers_,
                                        columns=pc_cols)
    }
    return df_out, meta


# funcion que dice hola que tal
def say_hello(name: str) -> str:
    """
    Función simple que devuelve un saludo personalizado.
    
    Parámetros:
    -----------
    name : str
        Nombre de la persona a saludar.
    
    Retorna:
    --------
    str
        Saludo personalizado.
    """
    return f"Hola, {name}! ¿Cómo estás?"

# --- helper: siempre paralelo --------------------------------
def _evaluate_parallel(Xref, Yref, Xnew, Ynew,
                       rts, orient, n_jobs):
    """Eficiencia de cada (x,y) sobre la frontera (Xref,Yref)."""
    def _score(x, y):
        dea = EnvelopDEA(rts, orient)
        dea.fit(np.vstack([Xref, x]), np.vstack([Yref, y]))
        return dea.results[-1].score            # plural en v1.0.x
    return np.array(Parallel(n_jobs=n_jobs)(
        delayed(_score)(x, y) for x, y in zip(Xnew, Ynew)
    ), dtype=float)


# --- función principal simplificada ---------------------------
def calculate_dea_malmquist_fast(df_t, df_t1,
                                 input_cols, output_cols,
                                 rts="CRS", orientation="in",
                                 n_jobs=4, use_cross=True,
                                 top_ids=None,
                                 max_dmus=None,
                                 top_input_col: str | None = None,
                                 top_n: int = 30):
    """Índice Malmquist con top-N opcional y %ΔProd.  Versión 100 % fallback."""

    # 1 ▸ Filtrar positivos y alinear IDs
    pos = lambda df: df[(df[input_cols] > 0).all(axis=1) &
                        (df[output_cols] > 0).all(axis=1)]
    df_t, df_t1 = map(pos, (df_t, df_t1))

    ids = sorted(set(df_t.hospital_id) & set(df_t1.hospital_id))
    if not ids:
        raise ValueError("No hay hospitales comunes tras filtrar > 0")

    # 2 ▸ Recorte top (si se pide)
    if top_input_col is not None:
        if top_input_col not in input_cols:
            raise ValueError("top_input_col debe ser uno de input_cols")
        ids = (df_t.loc[df_t.hospital_id.isin(ids)]
                  .nlargest(top_n, top_input_col)["hospital_id"]
                  .tolist())
    elif top_ids is not None:
        ids = [i for i in ids if i in top_ids]
    elif max_dmus is not None:
        ids = ids[:max_dmus]

    if not ids:
        raise ValueError("No quedan hospitales tras aplicar el filtro de top")

    # 3 ▸ Subsets
    df1 = df_t .loc[df_t .hospital_id.isin(ids)].sort_values("hospital_id")
    df2 = df_t1.loc[df_t1.hospital_id.isin(ids)].sort_values("hospital_id")

    X1, Y1 = df1[input_cols].to_numpy(), df1[output_cols].to_numpy()
    X2, Y2 = df2[input_cols].to_numpy(), df2[output_cols].to_numpy()

    # 4 ▸ Fronteras propias
    dea1 = EnvelopDEA(rts, orientation, n_jobs); dea1.fit(X1, Y1)
    dea2 = EnvelopDEA(rts, orientation, n_jobs); dea2.fit(X2, Y2)

    eff1 = np.array([r.score for r in dea1.results])
    eff2 = np.array([r.score for r in dea2.results])

    # 5 ▸ Cross-efficiencies (si se piden)
    if use_cross:
        tech1_on_2 = _evaluate_parallel(X1, Y1, X2, Y2,
                                        rts, orientation, n_jobs)
        tech2_on_1 = _evaluate_parallel(X2, Y2, X1, Y1,
                                        rts, orientation, n_jobs)
        TECH = np.sqrt((tech1_on_2 / eff1) * (eff2 / tech2_on_1))
    else:
        TECH = np.ones_like(eff1)

    # 6 ▸ Índices finales
    EFFCH     = eff2 / eff1
    MALMQUIST = EFFCH * TECH
    PCT_DELTA = (MALMQUIST - 1) * 100       # %ΔProd

    df_out = pd.DataFrame({
        "EFF_t":     eff1,
        "EFF_t1":    eff2,
        "EFFCH":     EFFCH,
        "TECH":      TECH,
        "Malmquist": MALMQUIST,
        "%ΔProd":    PCT_DELTA
    }, index=df1.hospital_id)

    summary = {
        "EFFCH_mean":     float(EFFCH.mean()),
        "TECH_mean":      float(TECH.mean()),
        "Malmquist_mean": float(MALMQUIST.mean()),
        "pctΔProd_mean":  float(PCT_DELTA.mean()),
        "n_hospitals":    len(eff1)
    }
    return df_out, summary

def determinant_analysis(df: pd.DataFrame,
                         dependent: str,
                         independents: List[str],
                         efficiency_method: str = "SFA",
                         input_cols: List[str] = None,
                         output_cols: List[str] = None,
                         top_n: int = 5,
                         add_constant: bool = True
                        ) -> Tuple[pd.DataFrame, Dict]:
    """
    Calcula eficiencia (SFA o DEA) y luego ajusta un modelo OLS para analizar determinantes.
    
    Parámetros
    ----------
    df               : DataFrame con los datos
    dependent        : nombre de la columna dependiente (Y) o "eficiencia" para usar SFA/DEA
    independents     : lista de columnas explicativas (X)
    efficiency_method: "SFA" o "DEA" (solo se usa si dependent == "eficiencia")
    input_cols       : columnas de inputs para SFA/DEA (requerido si dependent == "eficiencia")
    output_cols      : columnas de outputs para SFA/DEA (requerido si dependent == "eficiencia")
    top_n            : nº de determinantes "clave" a destacar
    add_constant     : añade intercepto si True
    
    Devuelve
    --------
    coef_table : DataFrame con coef, std_err, t, p
    meta       : dict con r2, r2_adj, top_vars y método usado
    """
    df_work = df.copy()
    
    # Si la variable dependiente es "eficiencia", calcular SFA o DEA
    if dependent == "eficiencia":
        if input_cols is None or output_cols is None:
            raise ValueError("input_cols y output_cols son requeridos cuando dependent='eficiencia'")
        
        if efficiency_method.upper() == "SFA":
            # Calcular SFA - pasar solo la primera columna de output como lista de un elemento
            output_col_sfa = [output_cols[0]] if isinstance(output_cols, list) else [output_cols]
            df_eff, metrics_eff = calculate_sfa_metrics(
                df_work, 
                input_cols, 
                output_col_sfa
            )
            efficiency_col = "ET SFA"
            
        elif efficiency_method.upper() == "DEA":
            # Calcular DEA
            df_eff, metrics_eff = calculate_dea_metrics(
                df_work,
                input_cols,
                output_cols
            )
            efficiency_col = "ET DEA"
            
        else:
            raise ValueError("efficiency_method debe ser 'SFA' o 'DEA'")
        
        # Usar la eficiencia calculada como variable dependiente
        df_work = df_eff
        dependent_col = efficiency_col
        
    else:
        # Usar la variable dependiente especificada directamente
        dependent_col = dependent
        efficiency_method = "Directo"
    
    # 0) Filtrar filas completas
    df_clean = df_work.dropna(subset=[dependent_col] + independents).copy()

    # 1) Matrices
    y = df_clean[dependent_col].astype(float).to_numpy()
    X = df_clean[independents].astype(float)
    if add_constant:
        X = sm.add_constant(X)
    
    # 2) Ajustar modelo
    model = sm.OLS(y, X).fit()
    
    # 3) Tabla de coeficientes
    coef_table = model.summary2().tables[1]                 # coef, std err, t, P>|t|
    coef_table.index.name = "variable"
    coef_table.reset_index(inplace=True)
    
    # 4) Variables "clave"  (|coef| grande & p<0.05)
    sig = coef_table[coef_table["P>|t|"] < 0.05].copy()
    sig["abs_coef"] = sig["Coef."].abs()
    sig_sorted = sig.sort_values("abs_coef", ascending=False)
    top_vars = sig_sorted["variable"].head(top_n).tolist()
    
    # 5) Métricas de resumen
    meta = {
        "r2":      model.rsquared,
        "r2_adj":  model.rsquared_adj,
        "top_vars": top_vars,
        "method": efficiency_method,
        "dependent_variable": dependent_col,
        "n_observations": len(df_clean)
    }
    return coef_table, meta