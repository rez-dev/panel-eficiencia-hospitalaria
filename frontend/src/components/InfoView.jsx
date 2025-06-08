import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingFilled,
  BookOutlined,
  DatabaseOutlined,
  CalculatorOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  MailOutlined,
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
                <strong>Ministerio de Salud:</strong> Estadísticas oficiales de
                hospitales públicos
              </li>
              <li>
                <strong>DANE:</strong> Información socioeconómica y demográfica
              </li>
              <li>
                <strong>Registros hospitalarios:</strong> Datos operacionales y
                financieros
              </li>
              <li>
                <strong>Encuestas especializadas:</strong> Información sobre
                recursos y servicios
              </li>
            </ul>
            <p>
              Todos los datos son actualizados periódicamente para garantizar la
              precisión y relevancia del análisis.
            </p>
          </div>
        );
      case "dea":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              Análisis Envolvente de Datos (DEA)
            </Title>
            <p>
              El DEA es una técnica de programación lineal que permite evaluar
              la eficiencia relativa de unidades de decisión (hospitales) que
              utilizan múltiples inputs para producir múltiples outputs.
            </p>
            <p>
              <strong>Características principales:</strong>
            </p>
            <ul>
              <li>No requiere especificación de forma funcional</li>
              <li>Permite múltiples inputs y outputs</li>
              <li>Identifica benchmarks para unidades ineficientes</li>
              <li>Proporciona medidas de eficiencia técnica</li>
            </ul>
          </div>
        );
      case "sfa":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              Análisis de Frontera Estocástica (SFA)
            </Title>
            <p>
              El SFA es un método econométrico que estima una frontera de
              producción que representa el máximo output alcanzable dado un
              nivel de inputs.
            </p>
            <p>
              <strong>Ventajas del SFA:</strong>
            </p>
            <ul>
              <li>Separa la ineficiencia del ruido estadístico</li>
              <li>Permite inferencia estadística</li>
              <li>Maneja el error de medición</li>
              <li>Proporciona intervalos de confianza</li>
            </ul>
          </div>
        );
      case "dea-m":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              DEA de Malmquist (DEA-M)
            </Title>
            <p>
              El índice de Malmquist basado en DEA permite analizar los cambios
              en la productividad a lo largo del tiempo.
            </p>
            <p>
              <strong>Componentes del análisis:</strong>
            </p>
            <ul>
              <li>
                <strong>Cambio en eficiencia técnica:</strong> Mejora en la
                gestión
              </li>
              <li>
                <strong>Cambio tecnológico:</strong> Innovación y progreso
                técnico
              </li>
              <li>
                <strong>Cambio en productividad total:</strong> Efecto combinado
              </li>
            </ul>
          </div>
        );
      case "tobit":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              Modelo Tobit
            </Title>
            <p>
              El modelo Tobit se utiliza para analizar los determinantes de la
              eficiencia hospitalaria cuando la variable dependiente está
              censurada (valores entre 0 y 1).
            </p>
            <p>
              <strong>Aplicaciones:</strong>
            </p>
            <ul>
              <li>Identificación de factores que afectan la eficiencia</li>
              <li>Análisis de variables continuas censuradas</li>
              <li>Evaluación del impacto de políticas</li>
              <li>Predicción de niveles de eficiencia</li>
            </ul>
          </div>
        );
      case "pca-kmeans":
        return (
          <div>
            <Title level={3} style={{ color: "#722ed1", marginBottom: "16px" }}>
              PCA & K-means Clustering
            </Title>
            <p>
              Combinación de Análisis de Componentes Principales (PCA) y
              clustering K-means para identificar grupos de hospitales
              similares.
            </p>
            <p>
              <strong>Proceso metodológico:</strong>
            </p>
            <ul>
              <li>
                <strong>PCA:</strong> Reducción de dimensionalidad de variables
              </li>
              <li>
                <strong>K-means:</strong> Agrupación de hospitales similares
              </li>
              <li>
                <strong>Análisis de clusters:</strong> Caracterización de grupos
              </li>
              <li>
                <strong>Benchmarking:</strong> Identificación de mejores
                prácticas
              </li>
            </ul>
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
                máximo output con un nivel dado de inputs.
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
                <strong>Input:</strong> Recursos utilizados (personal, camas,
                presupuesto).
              </div>
              <div>
                <strong>Output:</strong> Resultados producidos (consultas,
                cirugías, egresos).
              </div>
            </div>
          </div>
        );
      case "actualizaciones":
        return (
          <div>
            <Title level={3} style={{ color: "#13c2c2", marginBottom: "16px" }}>
              Actualizaciones del Sistema
            </Title>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  padding: "12px",
                  border: "1px solid #e8e8e8",
                  borderRadius: "6px",
                }}
              >
                <strong>Versión 2.1.0 - Junio 2025</strong>
                <ul>
                  <li>Implementación de análisis PCA & K-means</li>
                  <li>Mejoras en la visualización de resultados</li>
                  <li>Optimización del rendimiento</li>
                </ul>
              </div>
              <div
                style={{
                  padding: "12px",
                  border: "1px solid #e8e8e8",
                  borderRadius: "6px",
                }}
              >
                <strong>Versión 2.0.0 - Marzo 2025</strong>
                <ul>
                  <li>Nueva interfaz de usuario</li>
                  <li>Integración de modelo Tobit</li>
                  <li>Actualización de fuentes de datos</li>
                </ul>
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
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <strong>Equipo de Desarrollo:</strong>
                <br />
                Universidad de Santiago de Chile
                <br />
                Departamento de Ingeniería Civil en Informática
              </div>
              <div>
                <strong>Contacto Principal:</strong>
                <br />
                Email: rodrigo.escobar.z@usach.cl
                <br />
              </div>
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
          label: "Tobit",
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
      key: "actualizaciones",
      icon: <ClockCircleOutlined />,
      label: "Actualizaciones",
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
