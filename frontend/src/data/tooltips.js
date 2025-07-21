// Archivo centralizado para el contenido de tooltips
// Aquí definimos todos los tooltips de la aplicación organizados por vista

export const tooltips = {
  eficiencia: {
    // Tooltips para los parámetros de cálculo
    parametros: {
      metodologia: {
        title: "Metodología de Cálculo",
        content: "Selecciona el método para calcular la eficiencia hospitalaria.",
        details: {
          "SFA (Análisis de Frontera Estocástica)": "Considera el ruido estadístico y errores de medición en los datos.",
          "DEA (Análisis Envolvente de Datos)": "Método no paramétrico que calcula eficiencia relativa comparando hospitales similares.",
          "DEA-M (Índice Malmquist)": "Analiza el cambio en la productividad a lo largo del tiempo, descomponiéndolo en cambios de eficiencia y tecnología."
        }
      },
      año: {
        title: "Año de Análisis",
        content: "Selecciona el año para el cual deseas calcular la eficiencia hospitalaria. Los datos disponibles van desde 2014 hasta 2023."
      },
      entradas: {
        title: "Variables de Entrada (Inputs)",
        content: "Recursos utilizados por los hospitales para generar servicios de salud.",
        options: {
          bienesyservicios: "Gastos en bienes y servicios no personales (suministros médicos, medicamentos, equipamiento, etc.)",
          remuneraciones: "Gastos en personal (médicos, enfermeros, personal administrativo y de apoyo)",
          diascamadisponibles: "Capacidad instalada en términos de días de cama disponibles para atención de pacientes"
        }
      },
      salidas: {
        title: "Variables de Salida (Outputs)", 
        content: "Servicios de salud producidos por los hospitales.",
        options: {
          consultas: "Número total de consultas médicas ambulatorias realizadas",
          grdxegresos: "Egresos hospitalarios ponderados por complejidad (GRD - Grupos Relacionados de Diagnóstico)",
          consultasurgencias: "Atenciones de urgencia y emergencia realizadas",
          examenes: "Procedimientos diagnósticos y exámenes realizados",
          quirofanos: "Intervenciones quirúrgicas y procedimientos realizados en pabellón"
        }
      },
      años: {
        title: "Período de Análisis (DEA-M)",
        content: "Define el período temporal para el análisis Malmquist. Se compara la productividad entre el año inicial y final."
      },
      variableTop: {
        title: "Variable de Análisis Principal",
        content: "Variable de entrada que se utilizará para análisis específicos y descomposición detallada en el método Malmquist."
      }
    },

    // Tooltips para los KPIs
    kpis: {
      SFA: {
        etPromedio: {
          title: "Eficiencia Técnica Promedio (SFA)",
          content: "Promedio de eficiencia técnica calculada mediante Análisis de Frontera Estocástica. Valores más cercanos a 1 indican mayor eficiencia."
        },
        hospitalesCriticos: {
          title: "Hospitales Críticos",
          content: "Porcentaje de hospitales con eficiencia por debajo del umbral crítico de 70%. Requieren intervención prioritaria."
        },
        variableClave: {
          title: "Variable Clave",
          content: "Variable de entrada que muestra mayor impacto en la eficiencia. Identifica el recurso más determinante en el desempeño hospitalario."
        },
        varianza: {
          title: "Varianza de Eficiencia",
          content: "Medida de dispersión de la eficiencia entre hospitales. Mayor varianza indica mayor heterogeneidad en el desempeño."
        }
      },
      DEA: {
        etPromedio: {
          title: "Eficiencia Técnica Promedio (DEA)",
          content: "Promedio de eficiencia técnica calculada mediante Análisis Envolvente de Datos. Valores expresados como porcentaje de la frontera eficiente."
        },
        hospitalesCriticos: {
          title: "Hospitales Críticos",
          content: "Porcentaje de hospitales con eficiencia por debajo del umbral crítico. Identifica unidades que requieren mejoras urgentes."
        },
        slackAlto: {
          title: "Slack Más Alto Promedio",
          content: "Promedio del mayor exceso de recursos (slack) identificado. Indica el potencial de reducción de inputs sin afectar outputs."
        },
        totalHospitales: {
          title: "Total de Hospitales",
          content: "Número total de hospitales incluidos en el análisis de eficiencia."
        }
      },
      "DEA-M": {
        deltaProd: {
          title: "Δ Productividad Promedio",
          content: "Cambio porcentual promedio en productividad entre períodos. Valores positivos indican mejora en la productividad total."
        },
        deltaEficiencia: {
          title: "Δ Eficiencia",
          content: "Componente de cambio en eficiencia del índice Malmquist. Mide si los hospitales se acercan o alejan de la frontera eficiente."
        },
        deltaTecnologia: {
          title: "Δ Tecnología",
          content: "Componente de cambio tecnológico del índice Malmquist. Mide el desplazamiento de la frontera de producción."
        },
        hospMejorados: {
          title: "Hospitales Mejorados",
          content: "Porcentaje de hospitales que experimentaron mejoras en productividad (Malmquist > 1) durante el período analizado."
        }
      }
    },

    // Tooltips para la tabla y mapa
    tabla: {
      columnas: {
        hospital: {
          title: "Hospital",
          content: "Nombre del establecimiento hospitalario incluido en el análisis de eficiencia."
        },
        eficienciaSFA: {
          title: "ET SFA (%)",
          content: "Eficiencia Técnica calculada mediante Análisis de Frontera Estocástica. Valores cercanos a 100% indican mayor eficiencia."
        },
        eficienciaDEA: {
          title: "ET DEA (%)",
          content: "Eficiencia Técnica calculada mediante Análisis Envolvente de Datos. Representa el porcentaje de eficiencia respecto a la frontera óptima."
        },
        percentil: {
          title: "Percentil",
          content: "Indica la posición del hospital respecto a los demás según su eficiencia técnica. Un percentil alto significa que el hospital es más eficiente en comparación con el resto; un percentil bajo indica menor eficiencia."
        },
        effT: {
          title: "EFF_t",
          content: "Eficiencia técnica en el período inicial (t). Mide qué tan cerca está el hospital de la frontera eficiente en el año base."
        },
        effT1: {
          title: "EFF_t1", 
          content: "Eficiencia técnica en el período final (t+1). Mide qué tan cerca está el hospital de la frontera eficiente en el año siguiente."
        },
        effch: {
          title: "EFFCH",
          content: "Cambio en Eficiencia. Ratio que mide si el hospital se acerca (>1) o se aleja (<1) de la frontera eficiente entre períodos."
        },
        tech: {
          title: "TECH",
          content: "Cambio Tecnológico. Mide el desplazamiento de la frontera de producción. Valores >1 indican progreso tecnológico."
        },
        malmquist: {
          title: "MALM (Malmquist)",
          content: "Índice de Productividad Total. Producto de EFFCH × TECH. Valores >1 indican mejora en productividad, <1 deterioro."
        },
        deltaProd: {
          title: "%ΔProd",
          content: "Cambio porcentual en productividad. Representa la variación total de productividad entre los períodos analizados."
        }
      },
      seleccion: {
        title: "Selección de Hospitales",
        content: "Selecciona hasta 2 hospitales para realizar comparaciones detalladas. Click en las casillas de verificación para seleccionar."
      },
      eficiencia: {
        title: "Eficiencia Técnica",
        content: "Puntuación de eficiencia del hospital. En SFA/DEA se expresa como porcentaje, en DEA-M como índice Malmquist."
      },
      percentil: {
        title: "Percentil de Eficiencia",
        content: "Indica la posición del hospital respecto a los demás según su eficiencia técnica. Un percentil alto significa que el hospital es más eficiente en comparación con el resto; un percentil bajo indica menor eficiencia."
      },
      malmquist: {
        title: "Índice Malmquist",
        content: "Índice que mide el cambio en productividad. Valores > 1 indican mejora, valores < 1 indican deterioro."
      }
    },

    // Tooltips para el mapa
    mapa: {
      leyenda: {
        title: "Leyenda del Mapa",
        content: "Los colores de los marcadores indican el nivel de eficiencia de cada hospital.",
        niveles: {
          alto: "Verde: Eficiencia alta (≥90% para SFA/DEA, Malmquist >1.1 para DEA-M)",
          medio: "Azul: Eficiencia media (80-89% para SFA/DEA, Malmquist 0.9-1.1 para DEA-M)",
          bajo: "Naranja: Eficiencia baja (<80% para SFA/DEA, Malmquist <0.9 para DEA-M)"
        }
      }
    },

    // Tooltips para botones de acción
    acciones: {
      calcular: {
        title: "Calcular Eficiencia",
        content: "Ejecuta el cálculo de eficiencia con los parámetros seleccionados. Los resultados se mostrarán en la tabla y mapa."
      },
      comparar: {
        title: "Comparar Hospitales",
        content: "Abre la vista de comparación detallada para los hospitales seleccionados. Permite análisis lado a lado de métricas clave."
      },
      determinantes: {
        title: "Analizar Determinantes",
        content: "Accede al análisis de factores determinantes de la eficiencia hospitalaria mediante técnicas de machine learning."
      }
    }
  },

  // Tooltips para la vista de comparación
  comparacion: {
    // Parámetros reutilizados de eficiencia
    parametros: {
      metodologia: {
        title: "Metodología de Cálculo",
        content: "Selecciona el método para calcular la eficiencia hospitalaria.",
        details: {
          "SFA (Análisis de Frontera Estocástica)": "Considera el ruido estadístico y errores de medición en los datos.",
          "DEA (Análisis Envolvente de Datos)": "Método no paramétrico que calcula eficiencia relativa comparando hospitales similares.",
          "DEA-M (Índice Malmquist)": "Analiza el cambio en la productividad a lo largo del tiempo, descomponiéndolo en cambios de eficiencia y tecnología."
        }
      },
      entradas: {
        title: "Variables de Entrada (Inputs)",
        content: "Recursos utilizados por los hospitales para generar servicios de salud.",
        options: {
          bienesyservicios: "Gastos en bienes y servicios no personales",
          remuneraciones: "Gastos en personal médico y administrativo",
          diascamadisponibles: "Capacidad instalada en días de cama disponibles"
        }
      },
      salidas: {
        title: "Variables de Salida (Outputs)", 
        content: "Servicios de salud producidos por los hospitales.",
        options: {
          consultas: "Número total de consultas médicas ambulatorias",
          grdxegresos: "Egresos hospitalarios ponderados por complejidad",
          consultasurgencias: "Atenciones de urgencia y emergencia",
          examenes: "Procedimientos diagnósticos realizados",
          quirofanos: "Intervenciones quirúrgicas realizadas"
        }
      }
    },

    // KPIs específicos de comparación
    kpis: {
      gapInsumos: {
        title: "Gap de Insumos",
        content: "Diferencia porcentual en el uso de recursos (inputs) entre los hospitales comparados. Indica la brecha en eficiencia de uso de insumos."
      },
      gapProductos: {
        title: "Gap de Productos", 
        content: "Diferencia porcentual en la producción de servicios (outputs) entre los hospitales. Muestra la brecha en capacidad productiva."
      },
      gapEficiencia: {
        title: "Gap de Eficiencia",
        content: "Diferencia porcentual en los niveles de eficiencia técnica entre los hospitales comparados. Refleja la brecha en desempeño global."
      }
    },

    // Métricas de hospitales
    metricas: {
      eficienciaTecnica: {
        title: "Eficiencia Técnica",
        content: "Nivel de eficiencia del hospital expresado como porcentaje. Indica qué tan bien utiliza los recursos para generar servicios."
      },
      percentilNacional: {
        title: "Percentil Nacional",
        content: "Posición del hospital en el ranking nacional de eficiencia. Percentil 1° = más eficiente del país."
      },
      region: {
        title: "Región",
        content: "Región geográfica donde está ubicado el hospital. Permite analizar patrones territoriales de eficiencia."
      },
      año: {
        title: "Año de Análisis",
        content: "Año de los datos utilizados para el cálculo de eficiencia. En comparación temporal, permite seleccionar diferentes años."
      },
      complejidad: {
        title: "Nivel de Complejidad",
        content: "Clasificación del hospital según la complejidad de servicios que ofrece (baja, media, alta complejidad)."
      }
    },

    // Entradas y salidas detalladas
    inputs: {
      bienesyservicios: {
        title: "Bienes y Servicios",
        content: "Gastos en suministros médicos, medicamentos, equipamiento y servicios no personales. Expresado en pesos chilenos."
      },
      remuneraciones: {
        title: "Remuneraciones",
        content: "Gastos totales en personal médico, enfermeros, técnicos y personal administrativo. Expresado en pesos chilenos."
      },
      diascamadisponibles: {
        title: "Días de Cama Disponibles",
        content: "Capacidad instalada total expresada en días de cama disponibles para atención de pacientes hospitalizados."
      }
    },

    outputs: {
      consultas: {
        title: "Consultas",
        content: "Número total de consultas médicas ambulatorias realizadas en el período de análisis."
      },
      grdxegresos: {
        title: "GRD x Egresos",
        content: "Egresos hospitalarios ponderados por complejidad usando Grupos Relacionados de Diagnóstico (GRD)."
      },
      consultasurgencias: {
        title: "Consultas de Urgencias",
        content: "Número total de atenciones de urgencia y emergencia realizadas."
      },
      examenes: {
        title: "Exámenes",
        content: "Cantidad de procedimientos diagnósticos y exámenes médicos realizados."
      },
      quirofanos: {
        title: "Quirófanos",
        content: "Número de intervenciones quirúrgicas y procedimientos realizados en pabellón."
      }
    },

    // Clasificación por eficiencia
    clasificacion: {
      altaEficiencia: {
        title: "Alta Eficiencia",
        content: "Hospitales con eficiencia ≥90%. Representan las mejores prácticas y referentes de eficiencia en el sistema."
      },
      eficienciaMedia: {
        title: "Eficiencia Media",
        content: "Hospitales con eficiencia entre 80-89%. Tienen buen desempeño con oportunidades de mejora específicas."
      },
      eficienciaBaja: {
        title: "Eficiencia Baja",
        content: "Hospitales con eficiencia <80%. Requieren intervenciones prioritarias para mejorar su desempeño."
      }
    },

    // Acciones
    acciones: {
      calcular: {
        title: "Calcular Comparación",
        content: "Ejecuta el cálculo de eficiencia para los hospitales seleccionados con los parámetros definidos."
      },
      seleccionAño: {
        title: "Selección de Año",
        content: "Para comparación temporal, permite seleccionar diferentes años para cada hospital y analizar la evolución."
      }
    }
  },
  
  determinantes: {
    // Tooltips para los parámetros de cálculo
    parametros: {
      metodologia: {
        title: "Método de Eficiencia Base",
        content: "Selecciona el método para calcular la eficiencia que será la variable dependiente en el análisis de determinantes.",
        details: {
          "SFA (Análisis de Frontera Estocástica)": "Utiliza la eficiencia técnica calculada mediante SFA como variable dependiente para el análisis econométrico.",
          "DEA (Análisis Envolvente de Datos)": "Utiliza la eficiencia técnica calculada mediante DEA como variable dependiente para el análisis econométrico."
        }
      },
      año: {
        title: "Año de Análisis",
        content: "Selecciona el año para el cual deseas analizar los determinantes de la eficiencia hospitalaria. Los datos disponibles van desde 2014 hasta 2023."
      },
      entradas: {
        title: "Variables de Entrada (Inputs para SFA/DEA)",
        content: "Recursos utilizados por los hospitales que serán incluidos en el cálculo de eficiencia base.",
        options: {
          bienesyservicios: "Gastos en bienes y servicios no personales (suministros médicos, medicamentos, equipamiento)",
          remuneraciones: "Gastos en personal (médicos, enfermeros, personal administrativo y de apoyo)",
          diascamadisponibles: "Capacidad instalada en términos de días de cama disponibles",
          quirofanos: "Número de quirófanos disponibles para intervenciones"
        }
      },
      salidas: {
        title: "Variables de Salida (Outputs para SFA/DEA)", 
        content: "Servicios de salud producidos por los hospitales que serán incluidos en el cálculo de eficiencia base.",
        options: {
          consultas: "Número total de consultas médicas ambulatorias realizadas",
          grdxegresos: "Egresos hospitalarios ponderados por complejidad (GRD)",
          consultasurgencias: "Atenciones de urgencia y emergencia realizadas",
          examenes: "Procedimientos diagnósticos y exámenes realizados"
        }
      },
      variablesIndependientes: {
        title: "Variables Independientes (Explicativas)",
        content: "Variables que se utilizarán para explicar las diferencias en eficiencia entre hospitales en el modelo econométrico.",
        options: {
          remuneraciones: "Nivel de gastos en personal como factor explicativo",
          bienesyservicios: "Nivel de gastos en bienes y servicios como factor explicativo",
          diascamadisponibles: "Capacidad instalada como factor explicativo",
          consultas: "Volumen de consultas como factor explicativo",
          grdxegresos: "Complejidad de casos como factor explicativo",
          consultasurgencias: "Volumen de urgencias como factor explicativo",
          examenes: "Volumen de exámenes como factor explicativo",
          quirofanos: "Número de quirófanos como factor explicativo",
          complejidad: "Nivel de complejidad del hospital como factor explicativo"
        }
      },
      variableDependiente: {
        title: "Variable Dependiente",
        content: "La eficiencia técnica calculada mediante el método seleccionado. Esta variable será explicada por las variables independientes en el modelo econométrico."
      }
    },

    // Tooltips para los KPIs
    kpis: {
      rCuadrado: {
        title: "R² (Coeficiente de Determinación)",
        content: "Mide qué proporción de la variabilidad en eficiencia es explicada por las variables independientes. Valores más altos indican mejor ajuste del modelo (0-1)."
      },
      variablesSignificativas: {
        title: "Variables Significativas",
        content: "Número de variables independientes que tienen un efecto estadísticamente significativo (p<0.05) sobre la eficiencia hospitalaria."
      },
      observaciones: {
        title: "Observaciones",
        content: "Número total de hospitales incluidos en el análisis econométrico. Una muestra mayor proporciona resultados más robustos."
      }
    },

    // Tooltips para el gráfico
    grafico: {
      titulo: {
        title: "Top 5 Determinantes de Eficiencia",
        content: "Muestra las 5 variables independientes con mayor impacto (en valor absoluto) sobre la eficiencia hospitalaria, ordenadas por magnitud de su coeficiente."
      },
      normalizacion: {
        title: "Normalización de Coeficientes",
        content: "Cuando está activada, escala todos los coeficientes al rango [-1, 1] para facilitar la comparación visual. Los valores originales se mantienen en el tooltip."
      },
      coeficientes: {
        title: "Interpretación de Coeficientes",
        content: "Barras positivas indican que la variable aumenta la eficiencia. Barras negativas indican que la variable disminuye la eficiencia. La altura refleja la magnitud del impacto."
      },
      significancia: {
        title: "Significancia Estadística",
        content: "Los colores de las barras pueden indicar si el efecto es estadísticamente significativo. Solo los coeficientes significativos (p<0.05) deben interpretarse como efectos reales."
      }
    },

    // Tooltips para la tabla de resultados
    tabla: {
      columnas: {
        variable: {
          title: "Variable",
          content: "Nombre de la variable independiente incluida en el modelo econométrico. Cada fila representa un factor que puede influir en la eficiencia."
        },
        coeficiente: {
          title: "Coeficiente",
          content: "Magnitud y dirección del efecto de la variable sobre la eficiencia. Valores positivos aumentan la eficiencia, negativos la disminuyen."
        },
        errorEstandar: {
          title: "Error Estándar",
          content: "Medida de precisión del coeficiente estimado. Errores menores indican estimaciones más precisas y confiables."
        },
        tStatistic: {
          title: "Estadístico t",
          content: "Ratio del coeficiente dividido por su error estándar. Valores altos (en valor absoluto) indican mayor significancia estadística."
        },
        pValor: {
          title: "Valor p",
          content: "Probabilidad de que el efecto observado sea debido al azar. Valores <0.05 indican efectos estadísticamente significativos."
        },
        significancia: {
          title: "Niveles de Significancia",
          content: "*** p<0.001 (muy significativo), ** p<0.01 (significativo), * p<0.05 (marginalmente significativo), sin símbolo = no significativo."
        }
      },
      estadisticas: {
        titulo: {
          title: "Estadísticas del Modelo",
          content: "Resumen de las métricas de calidad y ajuste del modelo econométrico. Permite evaluar la validez y robustez de los resultados."
        },
        rCuadrado: {
          title: "R²",
          content: "Proporción de varianza en eficiencia explicada por el modelo (0-1). Valores >0.3 indican buen poder explicativo."
        },
        rCuadradoAjustado: {
          title: "R² Ajustado",
          content: "R² ajustado por el número de variables. Penaliza la inclusión de variables irrelevantes, proporcionando una medida más conservadora."
        },
        observaciones: {
          title: "Número de Observaciones",
          content: "Cantidad de hospitales incluidos en el análisis. Muestras mayores proporcionan resultados más robustos y generalizables."
        },
        metodo: {
          title: "Método de Eficiencia",
          content: "Técnica utilizada para calcular la eficiencia que sirve como variable dependiente (SFA o DEA)."
        }
      }
    },

    // Tooltips para secciones y acciones
    secciones: {
      parametrosCalculo: {
        title: "Parámetros de Cálculo",
        content: "Configuración del método de eficiencia base que será utilizado como variable dependiente en el análisis econométrico."
      },
      variablesIndependientes: {
        title: "Variables Explicativas",
        content: "Factores que potencialmente influyen en la eficiencia hospitalaria. Estas variables serán utilizadas para explicar las diferencias en eficiencia entre hospitales."
      },
      variableDependiente: {
        title: "Variable a Explicar",
        content: "La eficiencia técnica calculada mediante SFA o DEA. El análisis buscará identificar qué factores explican las variaciones en esta variable."
      },
      resultados: {
        title: "Resultados del Análisis",
        content: "Resultados del modelo econométrico que muestra cómo las variables seleccionadas influyen en la eficiencia hospitalaria."
      }
    },

    // Tooltips para acciones
    acciones: {
      calcular: {
        title: "Calcular Análisis",
        content: "Ejecuta el análisis econométrico de determinantes con los parámetros seleccionados. Identifica qué factores explican las diferencias en eficiencia entre hospitales."
      },
      colapsar: {
        title: "Colapsar/Expandir Panel",
        content: "Minimiza o expande el panel de parámetros para optimizar el espacio de visualización de resultados."
      }
    }
  },

  dashboard: {
    // Tooltips para el dashboard
  },

  pcaCluster: {
    // Tooltips para los parámetros de cálculo
    parametros: {
      metodologia: {
        title: "Método de Eficiencia Base",
        content: "Selecciona el método para calcular la eficiencia que será utilizada en el análisis de componentes principales y clusterización.",
        details: {
          "SFA (Análisis de Frontera Estocástica)": "Utiliza la eficiencia técnica calculada mediante SFA como base para el análisis de componentes principales.",
          "DEA (Análisis Envolvente de Datos)": "Utiliza la eficiencia técnica calculada mediante DEA como base para el análisis de componentes principales.",
          "DEA-M (Índice Malmquist)": "Utiliza los índices de productividad Malmquist como base para el análisis de componentes principales."
        }
      },
      año: {
        title: "Año de Análisis",
        content: "Selecciona el año para el cual deseas realizar el análisis de componentes principales y clusterización. Los datos disponibles van desde 2014 hasta 2024."
      },
      componentes: {
        title: "Número de Componentes Principales",
        content: "Define cuántos componentes principales se utilizarán en el análisis (máximo 3 para visualización). Más componentes capturan más variabilidad pero complican la interpretación.",
        details: {
          "1 componente": "Análisis unidimensional, captura la mayor variabilidad en una sola dimensión.",
          "2 componentes": "Análisis bidimensional, permite visualización en scatter plot 2D.",
          "3 componentes": "Análisis tridimensional, captura más variabilidad pero es más complejo de interpretar."
        }
      },
      clusters: {
        title: "Número de Clústeres",
        content: "Define el número de grupos en los que se clasificarán los hospitales. 'Auto' utiliza métodos estadísticos para determinar el número óptimo.",
        details: {
          "Auto": "Utiliza el método del codo y silhouette para determinar automáticamente el número óptimo de clústeres.",
          "Manual": "Permite especificar manualmente el número de clústeres (2-8)."
        }
      },
      entradas: {
        title: "Variables de Entrada (Inputs)",
        content: "Recursos utilizados por los hospitales que serán incluidos en el análisis de componentes principales.",
        options: {
          bienesyservicios: "Gastos en bienes y servicios no personales (suministros médicos, medicamentos, equipamiento)",
          remuneraciones: "Gastos en personal (médicos, enfermeros, personal administrativo y de apoyo)",
          diascamadisponibles: "Capacidad instalada en términos de días de cama disponibles"
        }
      },
      salidas: {
        title: "Variables de Salida (Outputs)",
        content: "Servicios de salud producidos por los hospitales que serán incluidos en el análisis de componentes principales.",
        options: {
          consultas: "Número total de consultas médicas ambulatorias realizadas",
          grdxegresos: "Egresos hospitalarios ponderados por complejidad (GRD)",
          consultasurgencias: "Atenciones de urgencia y emergencia realizadas",
          examenes: "Procedimientos diagnósticos y exámenes realizados",
          quirofanos: "Intervenciones quirúrgicas y procedimientos realizados"
        }
      }
    },

    // Tooltips para los KPIs
    kpis: {
      varianzaExplicada: {
        title: "Varianza Explicada Total",
        content: "Porcentaje de la variabilidad total de los datos que es capturada por los componentes principales seleccionados. Valores más altos indican mejor representación de los datos originales."
      },
      numClusters: {
        title: "Número de Clústeres",
        content: "Cantidad de grupos identificados en el análisis de clusterización. Puede ser determinado automáticamente o especificado manualmente."
      },
      silhouette: {
        title: "Coeficiente Silhouette",
        content: "Medida de calidad de la clusterización (0-1). Valores cercanos a 1 indican clústeres bien definidos y separados. Valores cercanos a 0 indican clústeres ambiguos."
      }
    },

    // Tooltips para el gráfico de clusterización
    grafico: {
      titulo: {
        title: "Gráfico de Clusterización",
        content: "Visualización de los hospitales en el espacio de componentes principales, coloreados por clúster. Permite identificar patrones y agrupaciones naturales en los datos."
      },
      componentes2D: {
        title: "Visualización 2D (PC1, PC2)",
        content: "Muestra los hospitales proyectados en las dos primeras componentes principales. PC1 captura la mayor variabilidad, PC2 la segunda mayor."
      },
      componentes3D: {
        title: "Visualización 3D (PC1, PC2, PC3)",
        content: "Muestra los hospitales proyectados en las tres primeras componentes principales. Proporciona una vista más completa pero más compleja de interpretar."
      },
      varianzaComponentes: {
        title: "Varianza por Componente",
        content: "Muestra el porcentaje de variabilidad explicada por cada componente principal individual. PC1 siempre explica la mayor varianza."
      }
    },

    // Tooltips para las tablas
    tabla: {
      matrizComponentes: {
        titulo: {
          title: "Matriz de Componentes Principales",
          content: "Muestra la contribución (peso) de cada variable original en la formación de cada componente principal. Valores positivos y negativos indican direcciones opuestas de contribución."
        },
        interpretacion: {
          title: "Interpretación de Coeficientes",
          content: "Valores cercanos a ±1 indican alta contribución de la variable al componente. Valores cercanos a 0 indican baja contribución. El signo indica la dirección de la relación."
        }
      },
      caracterizacionClusters: {
        titulo: {
          title: "Caracterización de Clústeres",
          content: "Resumen estadístico de cada clúster identificado, mostrando el número de hospitales, eficiencia técnica promedio y valores promedio de componentes principales."
        },
        columnas: {
          cluster: {
            title: "Clúster",
            content: "Identificador numérico del grupo de hospitales. Cada clúster representa un patrón característico de comportamiento."
          },
          nHospitales: {
            title: "Número de Hospitales",
            content: "Cantidad de hospitales clasificados en este clúster. Clústeres con pocos hospitales pueden representar casos atípicos."
          },
          etMedia: {
            title: "Eficiencia Técnica Media",
            content: "Promedio de eficiencia técnica de los hospitales en el clúster. Permite identificar clústeres de alta, media o baja eficiencia."
          },
          pc1Media: {
            title: "Media PC1",
            content: "Valor promedio del primer componente principal para los hospitales del clúster. PC1 captura la mayor variabilidad de los datos."
          },
          pc2Media: {
            title: "Media PC2",
            content: "Valor promedio del segundo componente principal para los hospitales del clúster. PC2 captura la segunda mayor variabilidad."
          },
          pc3Media: {
            title: "Media PC3",
            content: "Valor promedio del tercer componente principal para los hospitales del clúster. Solo visible cuando se utilizan 3 o más componentes."
          }
        }
      }
    },

    // Tooltips para secciones principales
    secciones: {
      parametrosCalculo: {
        title: "Parámetros de Cálculo",
        content: "Configuración del análisis de componentes principales y clusterización. Define la metodología base, variables y parámetros del algoritmo."
      },
      componentesClusteres: {
        title: "Componentes Principales y Clústeres",
        content: "Resultados del análisis que incluyen la visualización gráfica de clústeres y las tablas de caracterización de componentes y grupos."
      }
    },

    // Tooltips para acciones
    acciones: {
      calcular: {
        title: "Calcular Análisis",
        content: "Ejecuta el análisis de componentes principales y clusterización con los parámetros seleccionados. Identifica patrones y agrupa hospitales similares."
      }
    }
  }
};

// Función helper para obtener tooltip por ruta
export const getTooltip = (vista, categoria, clave, subclave = null) => {
  try {
    let tooltip = tooltips[vista]?.[categoria]?.[clave];
    if (subclave && tooltip) {
      tooltip = tooltip[subclave];
    }
    return tooltip || null;
  } catch (error) {
    console.warn(`Tooltip no encontrado: ${vista}.${categoria}.${clave}${subclave ? `.${subclave}` : ''}`);
    return null;
  }
};

// Función para obtener todos los tooltips de una categoría
export const getTooltipCategory = (vista, categoria) => {
  return tooltips[vista]?.[categoria] || {};
};
