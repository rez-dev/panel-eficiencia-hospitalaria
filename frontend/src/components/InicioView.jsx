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
  UserOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
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
            style={{ textAlign: "center", marginBottom: "16px" }}
          >
            Bienvenido al Panel Interactivo de Eficiencia Hospitalaria
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
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Button
              type="primary"
              size="large"
              icon={<RocketFilled />}
              onClick={() => onNavigate("eficiencia")}
              style={{
                fontSize: "16px",
                height: "50px",
                paddingLeft: "32px",
                paddingRight: "32px",
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
              }}
            >
              Empezar Análisis
            </Button>{" "}
          </div>
          <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Hospitales Analizados"
                  value={125}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Indicadores Calculados"
                  value={456}
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Análisis Completados"
                  value={89}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Reportes Generados"
                  value={234}
                  prefix={<PieChartOutlined />}
                  valueStyle={{ color: "#eb2f96" }}
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Eficiencia Técnica" bordered={false}>
                <Paragraph>
                  Analiza la eficiencia técnica de las instituciones de salud
                  utilizando metodologías avanzadas como DEA (Data Envelopment
                  Analysis).
                </Paragraph>
                <ul>
                  <li>Análisis de inputs y outputs</li>
                  <li>Cálculo de scores de eficiencia</li>
                  <li>Identificación de benchmarks</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Comparación de Hospitales" bordered={false}>
                <Paragraph>
                  Compara el desempeño de diferentes instituciones de salud para
                  identificar mejores prácticas y oportunidades de mejora.
                </Paragraph>
                <ul>
                  <li>Rankings de eficiencia</li>
                  <li>Análisis comparativo</li>
                  <li>Identificación de outliers</li>
                </ul>
              </Card>
            </Col>
          </Row>
          <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
            <Col xs={24} lg={12}>
              <Card title="Análisis de Determinantes" bordered={false}>
                <Paragraph>
                  Identifica los factores que influyen en la eficiencia técnica
                  de las instituciones de salud.
                </Paragraph>
                <ul>
                  <li>Variables contextuales</li>
                  <li>Factores organizacionales</li>
                  <li>Análisis de regresión</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="PCA & Análisis de Clúster" bordered={false}>
                <Paragraph>
                  Agrupa instituciones similares y reduce la dimensionalidad de
                  los datos para facilitar el análisis.
                </Paragraph>
                <ul>
                  <li>Análisis de componentes principales</li>
                  <li>Clustering jerárquico</li>
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
