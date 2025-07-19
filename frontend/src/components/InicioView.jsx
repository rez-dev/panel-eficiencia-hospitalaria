import React from "react";
import {
  Layout,
  theme,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Button,
} from "antd";
import {
  MedicineBoxFilled,
  DatabaseFilled,
  CalendarFilled,
  ToolFilled,
  RocketFilled,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const InicioView = ({ onNavigate }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ height: "calc(100vh - 64px)" }}>
      <Content
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 24,
            flex: 1,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {" "}
          <Title
            level={1}
            style={{
              textAlign: "center",
              marginBottom: "16px",
              marginTop: "0px",
            }}
          >
            Bienvenido al panel interactivo de análisis de eficiencia
            hospitalaria
          </Title>{" "}
          <Paragraph
            style={{
              fontSize: "16px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            Mide, compara y entiende el desempeño de la red asistencial de Chile
          </Paragraph>{" "}
          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background:
                    "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                  border: "1px solid #91d5ff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
              >
                <Statistic
                  title={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1890ff",
                      }}
                    >
                      Total de Hospitales
                    </span>
                  }
                  value={195}
                  prefix={
                    <MedicineBoxFilled
                      style={{
                        fontSize: "24px",
                        color: "#1890ff",
                        marginRight: "8px",
                      }}
                    />
                  }
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background:
                    "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                  border: "1px solid #91d5ff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
              >
                <Statistic
                  title={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1890ff",
                      }}
                    >
                      Variables Analizadas
                    </span>
                  }
                  value={15}
                  prefix={
                    <DatabaseFilled
                      style={{
                        fontSize: "24px",
                        color: "#1890ff",
                        marginRight: "8px",
                      }}
                    />
                  }
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background:
                    "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                  border: "1px solid #91d5ff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
              >
                <Statistic
                  title={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1890ff",
                      }}
                    >
                      Años de Datos
                    </span>
                  }
                  value="2014-2023"
                  prefix={
                    <CalendarFilled
                      style={{
                        fontSize: "24px",
                        color: "#1890ff",
                        marginRight: "8px",
                      }}
                    />
                  }
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background:
                    "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                  border: "1px solid #91d5ff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
              >
                <Statistic
                  title={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1890ff",
                      }}
                    >
                      Herramientas de Análisis
                    </span>
                  }
                  value={6}
                  prefix={
                    <ToolFilled
                      style={{
                        fontSize: "24px",
                        color: "#1890ff",
                        marginRight: "8px",
                      }}
                    />
                  }
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
          </Row>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Button
              type="primary"
              size="large"
              icon={<RocketFilled />}
              onClick={() => onNavigate("eficiencia")}
              style={{
                fontSize: "18px",
                height: "60px",
                paddingLeft: "40px",
                paddingRight: "40px",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                borderColor: "transparent",
                borderRadius: "12px",
                boxShadow: "0 6px 16px rgba(24, 144, 255, 0.3)",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(24, 144, 255, 0.4)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #096dd9 0%, #0050b3 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(24, 144, 255, 0.3)";
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)";
              }}
            >
              Comenzar Análisis
            </Button>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                title="📊 Eficiencia Técnica"
                bordered={false}
                style={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Paragraph>
                  Analiza la eficiencia técnica de las instituciones de salud
                  utilizando metodologías avanzadas como SFA (Análisis de
                  Frontera Estocástica), DEA (Análisis Envolvente de Datos) o
                  DEA-M empleando índices de Malmquist.
                </Paragraph>
                <ul>
                  <li>Análisis de inputs y outputs</li>
                  <li>Cálculo de eficiencia técnica hospitalaria</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="🏥 Comparación de Hospitales"
                bordered={false}
                style={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Paragraph>
                  Compara el desempeño de diferentes instituciones de salud para
                  identificar mejores prácticas y oportunidades de mejora.
                </Paragraph>
                <ul>
                  <li>Rankings de eficiencia</li>
                  <li>Análisis comparativo</li>
                </ul>
              </Card>
            </Col>
          </Row>
          <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
            <Col xs={24} lg={12}>
              <Card
                title="🔍 Análisis de Determinantes"
                bordered={false}
                style={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Paragraph>
                  Explora los factores que inciden sobre la eficiencia
                  hospitalaria.
                </Paragraph>
                <ul>
                  <li>Variables explicativas seleccionadas</li>
                  <li>Resultados del modelo de regresión</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="🎯 PCA & Análisis de Clúster"
                bordered={false}
                style={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Paragraph>
                  Agrupa instituciones similares y reduce la dimensionalidad de
                  los datos para facilitar el análisis.
                </Paragraph>
                <ul>
                  <li>Análisis de componentes principales</li>
                  <li>Segmentación de hospitales</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default InicioView;
