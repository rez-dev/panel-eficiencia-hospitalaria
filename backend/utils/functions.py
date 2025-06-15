import numpy as np
import pandas as pd
from pysfa import SFA

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
    
    Retorna:
    --------
    df_out : DataFrame
      df con la nueva columna 'Eff_SFA'.
    metrics : dict
      {
        'ET_promedio': float,      # eficiencia técnica promedio
        'pct_criticos': float,     # % de CRÍTICOS (TE < te_threshold)
        'variable_clave': str,     # insumo con β más alto y p<0.05
        'sigma2': float,           # varianza total del error
        'betas': np.ndarray,       # todos los β incl. intercept y λ
        'p_values': np.ndarray     # todos los p-values
      }
    """
    # solo conservar las filas donde los inputs y outputs son mayores que 0
    df = df[(df[input_cols] > 0).all(axis=1) & (df[output_col] > 0).all(axis=1)]

    x = np.log(df[input_cols]).to_numpy()   # aplicar logaritmo a los inputs
    y = np.log(df[output_col]).to_numpy()   # aplicar logaritmo a los outputs

    sfa = SFA.SFA(y, x, fun=fun, method=method)
    sfa.optimize()
    
    # Extraer eficiencia y añadirla
    te = np.array(sfa.get_technical_efficiency())
    df_out = df.copy()
    df_out['ET SFA'] = te
    
    # Extraer parámetros
    all_betas = np.array(sfa.get_beta())     # [β0, β1..βk, λ]
    all_pvals = np.array(sfa.get_pvalue())
    sigma2    = sfa.get_sigma2()
    
    # ET promedio y % críticos
    et_promedio = float(te.mean())
    pct_crit    = float((te < te_threshold).mean() * 100)
    
    # Determinar variable clave
    k = len(input_cols)
    betas_in = all_betas[1:1+k]
    pvals_in = all_pvals[1:1+k]
    df_coef = pd.DataFrame({
        'input':   input_cols,
        'beta':    betas_in,
        'p_value': pvals_in
    })
    df_sign = df_coef[df_coef.p_value < 0.05].copy()
    if not df_sign.empty:
        df_sign['abs_beta'] = df_sign.beta.abs()
        var_clave = df_sign.sort_values('abs_beta', ascending=False).iloc[0].input
    else:
        var_clave = None
    
    # Empaquetar métricas
    metrics = {
        'ET_promedio':    et_promedio,
        'pct_criticos':   pct_crit,
        'variable_clave': var_clave,
        'sigma2':         float(sigma2),
        'betas':          all_betas,
        'p_values':       all_pvals
    }

    # imprimir summary de sfa
    # print(sfa.summary())
    
    return df_out, metrics

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