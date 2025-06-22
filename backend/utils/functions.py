import numpy as np
import pandas as pd
from pysfa import SFA
from Pyfrontier.frontier_model import EnvelopDEA
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
    # 1) CREAR MÁSCARA de hospitales válidos (inputs y outputs > 0)
    mask_validos = (df[input_cols] > 0).all(axis=1) & (df[output_col] > 0).all(axis=1)
    
    # 2) SEPARAR hospitales válidos e inválidos
    df_validos = df[mask_validos].copy()
    df_invalidos = df[~mask_validos].copy()
    
    # print(f"Hospitales válidos: {len(df_validos)}")
    # print(f"Hospitales inválidos (ET SFA = 0): {len(df_invalidos)}")
    
    # 3) EJECUTAR SFA solo en hospitales válidos
    if len(df_validos) > 0:
        x = np.log(df_validos[input_cols]).to_numpy()
        y = np.log(df_validos[output_col]).to_numpy()

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
    
    # 4) ASIGNAR ET SFA = 0 a hospitales inválidos
    if len(df_invalidos) > 0:
        df_invalidos['ET SFA'] = 0.0
        df_invalidos['percentil'] = 0  # Percentil 0 para inválidos
    
    # 5) COMBINAR ambos DataFrames
    df_out = pd.concat([df_validos, df_invalidos], ignore_index=True)
    
    # 6) RECALCULAR métricas incluyendo hospitales con ET SFA = 0
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