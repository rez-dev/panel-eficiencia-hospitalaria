import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingFilled,
  TrophyOutlined,
  LineChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  EditFilled,
} from "@ant-design/icons";
import {
  Layout,
  theme,
  Button,
  Select,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Radio,
  Input,
  Space,
} from "antd";

const { Content, Sider } = Layout;
const { Title } = Typography;

const DeterminantesView = ({ onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedVariable, setSelectedVariable] = useState("eficiencia");
  const [calculationMethod, setCalculationMethod] = useState("DEA");
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
        <div
          style={{
            padding: collapsed ? "8px" : "8px 16px 16px 16px",
            height: "calc(100% - 48px)",
            overflowY: "auto",
          }}
        >
          {" "}
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
              {" "}
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
                title="Parámetros de Cálculo"
              />{" "}
              <Button
                type="text"
                icon={<LineChartOutlined />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#722ed1",
                }}
                title="Variables Independientes"
              />
              <Button
                type="text"
                icon={<TrophyOutlined />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#40a9ff",
                }}
                title="Variable Dependiente"
              />
            </div>
          ) : (
            <>
              {" "}
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
                Parámetros de Cálculo
              </Title>{" "}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <LineChartOutlined
                  style={{
                    fontSize: "16px",
                    color: "#722ed1",
                    marginRight: "8px",
                  }}
                />
                <Title level={5} style={{ margin: 0, color: "#333" }}>
                  Variables Independientes
                </Title>
              </div>
              <Select
                mode="multiple"
                placeholder="Seleccionar variables"
                defaultValue={["camas", "personal", "presupuesto"]}
                style={{ width: "100%", marginBottom: "16px" }}
                options={[
                  { value: "camas", label: "Número de Camas" },
                  { value: "personal", label: "Personal Médico" },
                  { value: "presupuesto", label: "Presupuesto Anual" },
                  { value: "ubicacion", label: "Ubicación (Urbano/Rural)" },
                  { value: "anos", label: "Años de Operación" },
                  { value: "tipo", label: "Tipo de Hospital" },
                  { value: "tecnologia", label: "Nivel Tecnológico" },
                  { value: "especializacion", label: "Especialización" },
                  { value: "region", label: "Región Geográfica" },
                  { value: "publico", label: "Sector (Público/Privado)" },
                ]}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <TrophyOutlined
                  style={{
                    fontSize: "16px",
                    color: "#1890ff",
                    marginRight: "8px",
                  }}
                />
                <Title level={5} style={{ margin: 0, color: "#333" }}>
                  Variable Dependiente
                </Title>
              </div>{" "}
              <Select
                placeholder="Variable a explicar"
                value={selectedVariable}
                onChange={setSelectedVariable}
                disabled={true}
                style={{ width: "100%", marginBottom: "16px" }}
                options={[{ value: "eficiencia", label: "Eficiencia Técnica" }]}
              />
              <Button
                type="primary"
                size="large"
                style={{
                  width: "100%",
                  marginTop: "20px",
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                }}
                onClick={() => {
                  console.log("Calculando análisis de determinantes");
                }}
              >
                Calcular
              </Button>
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
          {/* Header con título y selector de año */}
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              marginTop: "8px",
            }}
          >
            {" "}
            <Title
              level={2}
              style={{
                margin: 0,
              }}
            >
              Análisis de determinantes de eficiencia
            </Title>{" "}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 120 }}
                options={[
                  { value: 2020, label: "2020" },
                  { value: 2021, label: "2021" },
                  { value: 2022, label: "2022" },
                  { value: 2023, label: "2023" },
                  { value: 2024, label: "2024" },
                ]}
              />
              <Radio.Group
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value)}
                size="middle"
              >
                <Radio.Button value="SFA">SFA</Radio.Button>
                <Radio.Button value="DEA">DEA</Radio.Button>
                <Radio.Button value="DEA-M">DEA-M</Radio.Button>
              </Radio.Group>
            </div>
          </div>{" "}
          {/* KPI Cards */}
          <div style={{ width: "100%", maxWidth: "1200px" }}>
            <Row
              gutter={[16, 16]}
              style={{ marginBottom: "8px", justifyContent: "center" }}
            >
              <Col xs={24} sm={8} md={8}>
                <Card
                  style={{
                    textAlign: "center",
                    height: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    border: "1px solid #e8f4f8",
                    background:
                      "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Statistic
                    title="R²"
                    value={0.85}
                    precision={3}
                    valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                    prefix={<LineChartOutlined />}
                    titleStyle={{
                      marginTop: "0px",
                      marginBottom: "4px",
                      fontSize: "13px",
                      lineHeight: "1.2",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <Card
                  style={{
                    textAlign: "center",
                    height: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    border: "1px solid #f0f9e8",
                    background:
                      "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Statistic
                    title="β significativos"
                    value={6}
                    valueStyle={{ color: "#52c41a", fontSize: "18px" }}
                    prefix={<TrophyOutlined />}
                    titleStyle={{
                      marginTop: "0px",
                      marginBottom: "4px",
                      fontSize: "13px",
                      lineHeight: "1.2",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <Card
                  style={{
                    textAlign: "center",
                    height: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    border: "1px solid #fff1f0",
                    background:
                      "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Statistic
                    title="N° Observaciones"
                    value={248}
                    valueStyle={{ color: "#fa8c16", fontSize: "18px" }}
                    prefix={<TeamOutlined />}
                    titleStyle={{
                      marginTop: "0px",
                      marginBottom: "4px",
                      fontSize: "13px",
                      lineHeight: "1.2",
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
          {/* Sección de Mapa y Tabla */}
          <div style={{ width: "100%", maxWidth: "1200px", marginTop: "32px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
                height: "60px", // Altura fija exacta
              }}
            >
              {" "}
              <Title
                level={4}
                style={{ marginTop: 10, margin: 0, textAlign: "left" }}
              >
                Variables y Factores Determinantes
              </Title>
            </div>{" "}
            <Row gutter={[24, 0]} style={{ alignItems: "stretch" }}>
              {/* Gráfico de Correlación */}
              <Col xs={24} lg={10} style={{ display: "flex" }}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    height: "100%",
                    minHeight: "500px",
                    maxHeight: "500px",
                    flex: 1,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {" "}
                  <Title
                    level={5}
                    style={{
                      marginTop: "0px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    Matriz de Correlación de Variables
                  </Title>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f8f9fa",
                      borderRadius: "6px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div style={{ textAlign: "center", color: "#666" }}>
                      <LineChartOutlined
                        style={{
                          fontSize: "48px",
                          marginBottom: "16px",
                          color: "#1890ff",
                        }}
                      />
                      <div style={{ fontSize: "16px", fontWeight: "500" }}>
                        Gráfico de Correlación
                      </div>{" "}
                      <div style={{ fontSize: "14px", marginTop: "8px" }}>
                        Análisis con método: {calculationMethod}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          marginTop: "12px",
                          color: "#999",
                        }}
                      >
                        Variables: Camas, Personal, Presupuesto, Ubicación, etc.
                      </div>
                    </div>
                  </div>
                </div>
              </Col>{" "}
              {/* Tabla de Resultados Econométricos */}
              <Col xs={24} lg={14} style={{ display: "flex" }}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    height: "100%",
                    minHeight: "500px",
                    maxHeight: "500px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
                  }}
                >
                  {" "}
                  <Title
                    level={5}
                    style={{
                      marginTop: "0px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    Resultados del Análisis Econométrico
                  </Title>{" "}
                  <Table
                    columns={[
                      {
                        title: "Variable",
                        dataIndex: "variable",
                        key: "variable",
                        width: "30%",
                      },
                      {
                        title: "Coeficiente",
                        dataIndex: "coeficiente",
                        key: "coeficiente",
                        width: "18%",
                        render: (value) => value.toFixed(4),
                      },
                      {
                        title: "P-valor",
                        dataIndex: "pvalor",
                        key: "pvalor",
                        width: "15%",
                        render: (value) => (
                          <span
                            style={{
                              color: value < 0.05 ? "#52c41a" : "#ff4d4f",
                            }}
                          >
                            {value.toFixed(3)}
                          </span>
                        ),
                      },
                      {
                        title: "Error estándar",
                        dataIndex: "errorEstandar",
                        key: "errorEstandar",
                        width: "18%",
                        render: (value) => value.toFixed(4),
                      },
                      {
                        title: "VIF",
                        dataIndex: "vif",
                        key: "vif",
                        width: "19%",
                        render: (value) => (
                          <span
                            style={{
                              color:
                                value > 10
                                  ? "#ff4d4f"
                                  : value > 5
                                  ? "#fa8c16"
                                  : "#52c41a",
                            }}
                          >
                            {value.toFixed(2)}
                          </span>
                        ),
                      },
                    ]}
                    dataSource={[
                      {
                        key: 1,
                        variable: "Número de Camas",
                        coeficiente: 0.0234,
                        pvalor: 0.002,
                        errorEstandar: 0.0078,
                        vif: 2.34,
                      },
                      {
                        key: 2,
                        variable: "Personal Médico",
                        coeficiente: 0.0156,
                        pvalor: 0.001,
                        errorEstandar: 0.0045,
                        vif: 3.21,
                      },
                      {
                        key: 3,
                        variable: "Presupuesto Anual",
                        coeficiente: 0.0089,
                        pvalor: 0.023,
                        errorEstandar: 0.0039,
                        vif: 1.87,
                      },
                      {
                        key: 4,
                        variable: "Ubicación Urbana",
                        coeficiente: 0.0445,
                        pvalor: 0.0,
                        errorEstandar: 0.0123,
                        vif: 1.45,
                      },
                      {
                        key: 5,
                        variable: "Años de Operación",
                        coeficiente: 0.0012,
                        pvalor: 0.156,
                        errorEstandar: 0.0008,
                        vif: 1.23,
                      },
                      {
                        key: 6,
                        variable: "Tipo de Hospital",
                        coeficiente: 0.0267,
                        pvalor: 0.008,
                        errorEstandar: 0.0098,
                        vif: 2.67,
                      },
                      {
                        key: 7,
                        variable: "Tecnología Disponible",
                        coeficiente: 0.0198,
                        pvalor: 0.012,
                        errorEstandar: 0.0076,
                        vif: 4.12,
                      },
                      {
                        key: 8,
                        variable: "Especialización",
                        coeficiente: 0.0334,
                        pvalor: 0.003,
                        errorEstandar: 0.0112,
                        vif: 1.98,
                      },
                    ]}
                    pagination={false}
                    size="small"
                    scroll={{ y: "calc(100% - 80px)" }}
                    style={{ flex: 1 }}
                  />
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      background: "#f8f9fa",
                      borderRadius: "4px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    <strong>Estadísticas del modelo:</strong> R² = 0.847 | R²
                    ajustado = 0.823 | F-estadístico = 12.45 (p &lt; 0.001)
                    <br />
                    <strong>Significancia:</strong> *** p&lt;0.001, **
                    p&lt;0.01, * p&lt;0.05, NS = No significativo
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DeterminantesView;
