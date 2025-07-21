import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingFilled,
  BookOutlined,
  DatabaseOutlined,
  CalculatorOutlined,
  UnorderedListOutlined,
  MailOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Layout, theme, Button, Typography, Menu } from "antd";

const { Content, Sider } = Layout;
const { Title } = Typography;

const InfoView = ({ onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedSection, setSelectedSection] = useState("introduccion");

  const renderSectionContent = () => {
    switch (selectedSection) {
      case "introduccion":
        return (
          <div>
            <Title level={3} style={{ color: "#1890ff", marginBottom: "16px" }}>
              Introducción
            </Title>
            <p>
              Bienvenido al Panel de Análisis de Eficiencia Hospitalaria. Esta
              herramienta permite evaluar y comparar la eficiencia técnica de
              hospitales utilizando diversas metodologías econométricas y
              estadísticas.
            </p>
            <p>
              El panel integra múltiples enfoques metodológicos para
              proporcionar una visión integral del desempeño hospitalario,
              incluyendo análisis de determinantes, comparaciones de eficiencia
              y clustering de instituciones similares.
            </p>
          </div>
        );
      case "fuentes":
        return (
          <div>
            <Title level={3} style={{ color: "#52c41a", marginBottom: "16px" }}>
              Fuentes de Datos
            </Title>
            <p>Los datos utilizados en este panel provienen de:</p>
            <ul>
              <li>
                <strong>FONASA (Fondo Nacional de Salud): </strong> Datos de
                financiamiento, costos operacionales y presupuestos de
                hospitales públicos de Chile
              </li>
              <li>
                <strong>
                  DEIS (Departamento de Estadísticas e Información de Salud):{" "}
                </strong>{" "}
                Estadísticas oficiales de egresos hospitalarios, consultas
                médicas, procedimientos y recursos hospitalarios del Ministerio
                de Salud de Chile
              </li>
            </ul>
            <p>
              Los datos se actualizan anualmente tras un proceso de
              postprocesado que garantiza la calidad y consistencia de la
              información.
            </p>
          </div>
        );
      case "datos":
        return (
          <div>
            <Title level={3} style={{ color: "#fa8c16", marginBottom: "16px" }}>
              Datos Utilizados
            </Title>
            <p>
              Este panel procesa y analiza datos hospitalarios de Chile
              correspondientes al período 2014-2023, incluyendo información
              detallada sobre recursos, servicios y características
              institucionales.
            </p>

            <Title level={4} style={{ color: "#fa8c16", marginTop: "24px" }}>
              Variables del Sistema
            </Title>
            <ul>
              <li>
                <strong>Consultas:</strong> Total de consultas médicas
                ambulatorias realizadas
              </li>
              <li>
                <strong>GRD por egresos:</strong> Grupos relacionados por
                diagnóstico ajustados por complejidad de egresos
              </li>
              <li>
                <strong>Bienes y servicios:</strong> Gastos en bienes y
                servicios hospitalarios necesarios para la operación
              </li>
              <li>
                <strong>Remuneraciones:</strong> Gastos en personal médico,
                técnico y administrativo del hospital
              </li>
              <li>
                <strong>Días Camas Disponibles:</strong> Es el período
                comprendido entre las 0 y las 24 horas de un día, durante el
                cual una cama de hospital se mantiene a disposición para el uso
                de pacientes hospitalizados.
              </li>
              <li>
                <strong>Consultas urgencias:</strong> Número de atenciones de
                urgencia prestadas
              </li>
              <li>
                <strong>Exámenes:</strong> Cantidad de exámenes médicos y
                procedimientos diagnósticos realizados
              </li>
              <li>
                <strong>Quirófanos:</strong> Número de quirófanos disponibles
                para procedimientos médicos
              </li>
              <li>
                <strong>Año:</strong> Período temporal de los datos
                hospitalarios analizados
              </li>
              <li>
                <strong>Complejidad:</strong> Nivel de complejidad hospitalaria
                según cartera de servicios y especialidades
              </li>
              <li>
                <strong>Índice Ocupacional:</strong> Se interpreta como el
                porcentaje de ocupación de camas en un período determinado y
                permite monitorear la eficiencia en la gestión hospitalaria.
              </li>
              <li>
                <strong>Índice de Rotación:</strong> Mide el número de pacientes
                que pasan por cada cama hospitalaria en un período de tiempo
                determinado. Es el mejor indicador para dar cuenta de la
                productividad del recurso cama.
              </li>
              <li>
                <strong>Promedio Días de Estadía:</strong> Corresponde al
                promedio de días que el paciente permaneció hospitalizado en el
                establecimiento y corresponde al número de días transcurridos
                entre la fecha de ingreso y la fecha de egreso.
              </li>
              <li>
                <strong>Tasa de letalidad:</strong> Establece la relación entre
                los fallecidos por una enfermedad y los enfermos que padecen esa
                enfermedad.
              </li>
              <li>
                <strong>Egresos fallecidos:</strong> Es una subdivisión del
                número de egresos, correspondiente a las personas que han
                fallecido en un año dentro del proceso de hospitalización.
              </li>
            </ul>
          </div>
        );
      case "dea":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              Análisis Envolvente de Datos (DEA)
            </Title>
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                borderLeft: "4px solid #722ed1",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: 0, fontStyle: "italic", color: "#666" }}>
                <strong>Definición técnica:</strong> El Data Envelopment
                Analysis (DEA) es una técnica no paramétrica basada en
                programación lineal que evalúa la eficiencia técnica relativa de
                unidades de decisión (DMUs) homogéneas que transforman múltiples
                entradas en múltiples salidas. Construye una frontera de
                eficiencia empírica que envuelve todas las observaciones,
                identificando las DMUs eficientes que forman dicha frontera y
                calculando medidas de ineficiencia para las unidades no
                eficientes.
              </p>
            </div>
            <p>
              Imagina que queremos comparar qué tan bien funcionan diferentes
              hospitales. El DEA es como crear una "línea de meta" que
              representa el mejor desempeño posible, y luego medir qué tan cerca
              están todos los demás hospitales de esa línea.
            </p>
            <p>
              <strong>¿Cómo funciona en nuestro sistema?</strong>
            </p>
            <ul>
              <li>
                <strong>Filtrado inteligente:</strong> Solo analizamos
                hospitales con datos válidos (recursos y servicios mayores a
                cero)
              </li>
              <li>
                <strong>Cálculo de eficiencia:</strong> Cada hospital recibe una
                puntuación entre 0 y 1, donde 1 significa "perfectamente
                eficiente"
              </li>
              <li>
                <strong>Identificación de problemas:</strong> El sistema detecta
                automáticamente cuál recurso se está desperdiciando más
              </li>
              <li>
                <strong>Clasificación:</strong> Los hospitales se organizan en
                percentiles para facilitar las comparaciones
              </li>
            </ul>
            <p>
              <strong>Resultado práctico:</strong> Obtienes un ranking de
              hospitales y sabes exactamente dónde cada uno puede mejorar (por
              ejemplo, "este hospital podría atender más pacientes con el mismo
              personal").
            </p>
          </div>
        );
      case "sfa":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              Análisis de Frontera Estocástica (SFA)
            </Title>
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                borderLeft: "4px solid #722ed1",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: 0, fontStyle: "italic", color: "#666" }}>
                <strong>Definición técnica:</strong> El Stochastic Frontier
                Analysis (SFA) es un método econométrico paramétrico que estima
                una frontera de producción estocástica mediante la
                descomposición del término de error en dos componentes: ruido
                estadístico (v<sub>i</sub>) y ineficiencia técnica (u
                <sub>i</sub>). Utiliza técnicas de máxima verosimilitud para
                estimar los parámetros de la función de producción y separar la
                ineficiencia del ruido aleatorio, permitiendo inferencia
                estadística sobre los determinantes de la eficiencia.
              </p>
            </div>
            <p>
              El SFA es como tener un "detector de eficiencia" muy sofisticado.
              A diferencia del DEA, este método entiende que en la vida real
              siempre hay factores inesperados (como una pandemia o problemas
              técnicos) que pueden afectar el rendimiento de un hospital.
            </p>
            <p>
              <strong>¿Cómo trabaja nuestro sistema?</strong>
            </p>
            <ul>
              <li>
                <strong>Filtrado inteligente:</strong> Separa hospitales con
                datos válidos de aquellos con información incompleta
              </li>
              <li>
                <strong>Transformación logarítmica:</strong> Convierte los datos
                para obtener resultados más precisos y estables
              </li>
              <li>
                <strong>Cálculo estadístico:</strong> Genera puntuaciones de
                eficiencia considerando la variabilidad natural
              </li>
              <li>
                <strong>Identificación de factores clave:</strong> Determina
                automáticamente cuál recurso tiene mayor impacto en la
                eficiencia
              </li>
            </ul>
            <p>
              <strong>Ventaja principal:</strong> Puede distinguir entre
              "hospital realmente ineficiente" y "hospital que tuvo mala
              suerte", proporcionando evaluaciones más justas y realistas.
            </p>
          </div>
        );
      case "dea-m":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              Índice de Malmquist (DEA-M)
            </Title>
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                borderLeft: "4px solid #722ed1",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: 0, fontStyle: "italic", color: "#666" }}>
                <strong>Definición técnica:</strong> El Índice de Malmquist es
                una medida de productividad basada en DEA que descompone los
                cambios en la productividad total de los factores (PTF) entre
                dos períodos en dos componentes: cambio en eficiencia técnica
                (catching-up effect) y cambio tecnológico (frontier-shift
                effect). Se calcula como el cociente geométrico de las
                distancias a las fronteras de producción de ambos períodos,
                permitiendo evaluar el progreso productivo intertemporal de las
                unidades de decisión.
              </p>
            </div>
            <p>
              Imagina que quieres saber si un hospital está mejorando o
              empeorando con el tiempo. El Índice de Malmquist es como tener una
              "máquina del tiempo" que compara el mismo hospital en diferentes
              años para ver su evolución.
            </p>
            <p>
              <strong>¿Cómo funciona en nuestro análisis?</strong>
            </p>
            <ul>
              <li>
                <strong>Comparación temporal:</strong> Toma datos de dos años
                diferentes del mismo hospital
              </li>
              <li>
                <strong>Cálculo de fronteras:</strong> Crea "líneas de
                referencia" para cada año
              </li>
              <li>
                <strong>Evaluación cruzada:</strong> Mide cómo le iría al
                hospital de un año usando los estándares del otro año
              </li>
              <li>
                <strong>Selección inteligente:</strong> Puede enfocarse en los
                hospitales más grandes o relevantes para obtener resultados más
                confiables
              </li>
            </ul>
            <p>
              <strong>Resultado práctico:</strong> Obtienes tres medidas clave:
            </p>
            <ul>
              <li>
                <strong>Cambio en gestión:</strong> ¿El hospital se está
                administrando mejor o peor?
              </li>
              <li>
                <strong>Progreso tecnológico:</strong> ¿Ha mejorado la
                tecnología disponible en el sector?
              </li>
              <li>
                <strong>Cambio total de productividad:</strong> ¿El hospital
                produce más o menos con los mismos recursos?
              </li>
            </ul>
          </div>
        );
      case "tobit":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              Análisis de Determinantes
            </Title>
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                borderLeft: "4px solid #722ed1",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: 0, fontStyle: "italic", color: "#666" }}>
                <strong>Definición técnica:</strong> El análisis de
                determinantes de la eficiencia emplea modelos de regresión (OLS
                o Tobit) en dos etapas: primero se estiman puntuaciones de
                eficiencia mediante DEA o SFA, luego se utiliza estas
                puntuaciones como variable dependiente para identificar los
                factores institucionales, ambientales y organizacionales que
                explican las diferencias en eficiencia. El modelo Tobit es
                particularmente apropiado cuando la variable dependiente está
                censurada (bounded entre 0 y 1), mientras que OLS se emplea para
                variables dependientes continuas no censuradas.
              </p>
            </div>
            <p>
              Este análisis es como ser un "detective de la eficiencia". Su
              trabajo es descubrir qué factores hacen que algunos hospitales
              sean más eficientes que otros. ¿Es el tamaño del hospital? ¿La
              ubicación? ¿El tipo de servicios que ofrece?
            </p>
            <p>
              <strong>¿Cómo investiga nuestro sistema?</strong>
            </p>
            <ul>
              <li>
                <strong>Cálculo de eficiencia base:</strong> Primero determina
                qué tan eficiente es cada hospital usando DEA o SFA
              </li>
              <li>
                <strong>Análisis estadístico:</strong> Examina la relación entre
                la eficiencia y diferentes características del hospital
              </li>
              <li>
                <strong>Filtrado de datos limpios:</strong> Solo usa información
                completa y confiable
              </li>
              <li>
                <strong>Identificación automática:</strong> Encuentra los
                factores más importantes estadísticamente
              </li>
            </ul>
            <p>
              <strong>Resultados que obtienes:</strong>
            </p>
            <ul>
              <li>
                <strong>Factores clave:</strong> Los 5 elementos más importantes
                que afectan la eficiencia
              </li>
              <li>
                <strong>Nivel de confianza:</strong> Qué tan seguros podemos
                estar de estos resultados
              </li>
              <li>
                <strong>Capacidad explicativa:</strong> Qué porcentaje de la
                eficiencia hospitalaria podemos explicar
              </li>
              <li>
                <strong>Recomendaciones implícitas:</strong> Dónde enfocar los
                esfuerzos de mejora
              </li>
            </ul>
          </div>
        );
      case "pca-kmeans":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              Análisis de Grupos (PCA & K-means)
            </Title>
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                borderLeft: "4px solid #722ed1",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: 0, fontStyle: "italic", color: "#666" }}>
                <strong>Definición técnica:</strong> El análisis combinado
                PCA-K-means integra el Análisis de Componentes Principales (PCA)
                para la reducción de dimensionalidad con el algoritmo de
                clustering K-means para la segmentación. PCA transforma las
                variables originales mediante combinaciones lineales ortogonales
                que maximizan la varianza explicada, mientras que K-means agrupa
                las observaciones minimizando la suma de cuadrados
                intra-cluster. La metodología incluye selección automática del
                número óptimo de clusters mediante índices de validación como el
                coeficiente de silueta.
              </p>
            </div>
            <p>
              Imagina que tienes cientos de hospitales y quieres organizarlos en
              grupos que se parezcan entre sí. Este análisis es como tener un
              "organizador automático" que encuentra patrones ocultos y agrupa
              hospitales similares.
            </p>
            <p>
              <strong>¿Cómo organiza nuestro sistema?</strong>
            </p>
            <ul>
              <li>
                <strong>Simplificación inteligente (PCA):</strong> Toma muchas
                características de los hospitales y las resume en las más
                importantes
              </li>
              <li>
                <strong>Estandarización:</strong> Ajusta todas las medidas para
                que sean comparables
              </li>
              <li>
                <strong>Búsqueda del número óptimo:</strong> Determina
                automáticamente cuántos grupos tienen más sentido
              </li>
              <li>
                <strong>Agrupación automática (K-means):</strong> Asigna cada
                hospital al grupo que mejor le corresponde
              </li>
            </ul>
            <p>
              <strong>Resultados útiles:</strong>
            </p>
            <ul>
              <li>
                <strong>Grupos naturales:</strong> Hospitales organizados por
                similitudes reales
              </li>
              <li>
                <strong>Características de cada grupo:</strong> Qué hace único a
                cada tipo de hospital
              </li>
              <li>
                <strong>Benchmarks apropiados:</strong> Comparaciones justas
                entre hospitales similares
              </li>
              <li>
                <strong>Identificación de mejores prácticas:</strong> Hospitales
                modelo dentro de cada grupo
              </li>
            </ul>
            <p>
              <strong>Ejemplo práctico:</strong> Podríamos encontrar grupos como
              "hospitales rurales pequeños", "centros urbanos especializados" o
              "hospitales generales medianos", cada uno con sus propias
              características y estándares de comparación.
            </p>
          </div>
        );
      case "glosario":
        return (
          <div>
            <Title level={3} style={{ color: "#fa8c16", marginBottom: "16px" }}>
              Glosario de Términos
            </Title>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <strong>Eficiencia Técnica:</strong> Capacidad de producir el
                máximo output con un nivel dado de entradas.
              </div>
              <div>
                <strong>DMU (Decision Making Unit):</strong> Unidad de decisión,
                en este caso, hospitales.
              </div>
              <div>
                <strong>Frontera de Eficiencia:</strong> Límite que representa
                el mejor desempeño posible.
              </div>
              <div>
                <strong>Benchmark:</strong> Referencia o punto de comparación
                para medir el desempeño.
              </div>
              <div>
                <strong>Entrada:</strong> Recursos utilizados (personal, camas,
                presupuesto).
              </div>
              <div>
                <strong>Salida:</strong> Resultados producidos (consultas,
                cirugías, egresos).
              </div>
            </div>
          </div>
        );
      case "contacto":
        return (
          <div>
            <Title level={3} style={{ color: "#f5222d", marginBottom: "16px" }}>
              Información de Contacto
            </Title>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div>
                <strong>Rodrigo Javier Escobar Zamorano</strong>
              </div>
              <div>rodrigo.escobar.z@usach.cl</div>
              <div>Estudiante de Ingeniería Civil en Informática</div>
              <div>Universidad de Santiago de Chile</div>
              <div>Departamento de Ingeniería Informática</div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <Title level={3}>Selecciona una sección</Title>
            <p>
              Por favor, selecciona una sección del menú lateral para ver su
              contenido.
            </p>
          </div>
        );
    }
  };

  const menuItems = [
    {
      key: "introduccion",
      icon: <BookOutlined />,
      label: "Introducción",
    },
    {
      key: "fuentes",
      icon: <DatabaseOutlined />,
      label: "Fuentes de datos",
    },
    {
      key: "datos",
      icon: <FileTextOutlined />,
      label: "Datos utilizados",
    },
    {
      key: "metodologias",
      icon: <CalculatorOutlined />,
      label: "Metodologías",
      children: [
        {
          key: "dea",
          label: "DEA",
        },
        {
          key: "sfa",
          label: "SFA",
        },
        {
          key: "dea-m",
          label: "DEA-M",
        },
        {
          key: "tobit",
          label: "Análisis de determinantes",
        },
        {
          key: "pca-kmeans",
          label: "PCA & K-means",
        },
      ],
    },
    {
      key: "glosario",
      icon: <UnorderedListOutlined />,
      label: "Glosario",
    },
    {
      key: "contacto",
      icon: <MailOutlined />,
      label: "Contacto",
    },
  ];

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ height: "calc(100vh - 64px)" }}>
      <Sider
        width={280}
        style={{ background: colorBgContainer, position: "relative" }}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
      >
        {" "}
        <div
          style={{
            padding: collapsed ? "8px" : "8px 16px 16px 16px",
            height: "calc(100% - 48px)",
            overflowY: "auto",
          }}
        >
          {collapsed ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                paddingTop: "16px",
              }}
            >
              <Button
                type="text"
                icon={<SettingFilled />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#666",
                }}
                title="Secciones"
              />
            </div>
          ) : (
            <>
              <Title
                level={4}
                style={{
                  marginTop: "4px",
                  marginBottom: "20px",
                  color: "#333",
                  textAlign: "center",
                  borderBottom: "1px solid #e8e8e8",
                  paddingBottom: "12px",
                }}
              >
                Secciones
              </Title>
              <Menu
                mode="inline"
                selectedKeys={[selectedSection]}
                defaultOpenKeys={["metodologias"]}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                }}
                items={menuItems}
                onClick={({ key }) => setSelectedSection(key)}
              />
            </>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid #f0f0f0",
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: "100%",
              height: "48px",
              borderRadius: 0,
            }}
          />
        </div>
      </Sider>
      <Layout
        style={{
          padding: "0 24px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {" "}
        <Content
          style={{
            padding: 24,
            margin: "16px 0 0 0",
            flex: 1,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            height: "calc(100vh - 128px)",
          }}
        >
          {" "}
          {/* Header with title */}
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "32px",
              marginTop: "8px",
            }}
          >
            <Title
              level={2}
              style={{
                margin: 0,
              }}
            >
              Información acerca del panel
            </Title>
          </div>{" "}
          {/* Content area for information */}
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              textAlign: "left",
              padding: "20px",
              backgroundColor: "#fafafa",
              borderRadius: "8px",
              border: "1px solid #e8e8e8",
            }}
          >
            {renderSectionContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default InfoView;
