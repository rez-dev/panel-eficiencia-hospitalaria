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
          content: "Posición relativa del hospital en el ranking de eficiencia. Percentil 1° = más eficiente, percentil 100° = menos eficiente."
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
        content: "Posición relativa del hospital en el ranking de eficiencia. Percentil 1 = más eficiente, percentil 100 = menos eficiente."
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

  // Estructura preparada para otras vistas
  comparacion: {
    // Tooltips para la vista de comparación
  },
  
  determinantes: {
    // Tooltips para la vista de determinantes
  },

  dashboard: {
    // Tooltips para el dashboard
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
