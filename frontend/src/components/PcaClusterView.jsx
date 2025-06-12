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
  Slider,
  InputNumber,
} from "antd";

const { Content, Sider } = Layout;
const { Title } = Typography;

const PcaClusterView = ({ onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedVariable, setSelectedVariable] = useState("eficiencia");
  const [calculationMethod, setCalculationMethod] = useState("DEA");
  const [numComponents, setNumComponents] = useState(3);
  const [numClusters, setNumClusters] = useState(4);
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
                title="Parámetros de Cálculo"
              />
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
                  color: "#1890ff",
                }}
                title="N° de componentes"
              />
              <Button
                type="text"
                icon={<TeamOutlined />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#52c41a",
                }}
                title="N° de clústeres"
              />
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
                  color: "#1890ff",
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
              </Title>
              {/* N° de componentes section */}
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
                    color: "#1890ff",
                    marginRight: "8px",
                  }}
                />
                <Title level={5} style={{ margin: 0, color: "#333" }}>
                  N° de componentes
                </Title>
              </div>{" "}
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Slider
                  min={1}
                  max={10}
                  value={numComponents}
                  onChange={setNumComponents}
                  marks={{
                    1: "1",
                    5: "5",
                    10: "10",
                  }}
                  style={{ flex: 1 }}
                />
                <InputNumber
                  min={1}
                  max={10}
                  value={numComponents}
                  onChange={setNumComponents}
                  style={{ width: "60px" }}
                />
              </div>
              {/* N° de clústeres section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <TeamOutlined
                  style={{
                    fontSize: "16px",
                    color: "#52c41a",
                    marginRight: "8px",
                  }}
                />
                <Title level={5} style={{ margin: 0, color: "#333" }}>
                  N° de clústeres
                </Title>
              </div>{" "}
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Slider
                  min={2}
                  max={8}
                  value={numClusters}
                  onChange={setNumClusters}
                  marks={{
                    2: "2",
                    4: "4",
                    6: "6",
                    8: "8",
                  }}
                  style={{ flex: 1 }}
                />
                <InputNumber
                  min={2}
                  max={8}
                  value={numClusters}
                  onChange={setNumClusters}
                  style={{ width: "60px" }}
                />
              </div>
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
              Análisis de componentes y clusterización
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
                    title="Varianza explicada"
                    value={73.2}
                    precision={1}
                    suffix="%"
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
                    title="N° Clústeres"
                    value={numClusters}
                    valueStyle={{ color: "#52c41a", fontSize: "18px" }}
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
                    title="Silhouette"
                    value={0.68}
                    precision={2}
                    valueStyle={{ color: "#fa8c16", fontSize: "18px" }}
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
                Componentes principales y clústeres
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
                    Clusterización
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
                  {/* Primera tabla - Matriz de componentes */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "12px",
                        color: "#333",
                        textAlign: "center",
                      }}
                    >
                      Matriz de Componentes Principales
                    </div>
                    <Table
                      columns={[
                        {
                          title: "",
                          dataIndex: "component",
                          key: "component",
                          width: "15%",
                          render: (value) => (
                            <span style={{ fontWeight: "600", color: "#333" }}>
                              {value}
                            </span>
                          ),
                        },
                        {
                          title: "Bienes y servicios",
                          dataIndex: "bienes",
                          key: "bienes",
                          width: "21%",
                          render: (value) => (
                            <span
                              style={{
                                color: value < 0 ? "#ff4d4f" : "#52c41a",
                              }}
                            >
                              {value.toFixed(6)}
                            </span>
                          ),
                        },
                        {
                          title: "Remuneraciones",
                          dataIndex: "remuneraciones",
                          key: "remuneraciones",
                          width: "21%",
                          render: (value) => (
                            <span
                              style={{
                                color: value < 0 ? "#ff4d4f" : "#52c41a",
                              }}
                            >
                              {value.toFixed(6)}
                            </span>
                          ),
                        },
                        {
                          title: "Consultas",
                          dataIndex: "consultas",
                          key: "consultas",
                          width: "21%",
                          render: (value) => (
                            <span
                              style={{
                                color: value < 0 ? "#ff4d4f" : "#52c41a",
                              }}
                            >
                              {value.toFixed(6)}
                            </span>
                          ),
                        },
                        {
                          title: "Quirófanos",
                          dataIndex: "quirofanos",
                          key: "quirofanos",
                          width: "22%",
                          render: (value) => (
                            <span
                              style={{
                                color: value < 0 ? "#ff4d4f" : "#52c41a",
                              }}
                            >
                              {value.toFixed(6)}
                            </span>
                          ),
                        },
                      ]}
                      dataSource={[
                        {
                          key: 1,
                          component: "PC1",
                          bienes: -0.56245,
                          remuneraciones: -0.50885,
                          consultas: 0.35,
                          quirofanos: 0.28305,
                        },
                        {
                          key: 2,
                          component: "PC2",
                          bienes: -0.189417,
                          remuneraciones: -0.180269,
                          consultas: -0.180767,
                          quirofanos: 0.95752,
                        },
                      ]}
                      pagination={false}
                      size="small"
                      scroll={{ y: "calc(50% - 40px)" }}
                      style={{ flex: 1 }}
                    />
                  </div>{" "}
                  {/* Segunda tabla - Centroides */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {" "}
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "12px",
                        color: "#333",
                        textAlign: "center",
                      }}
                    >
                      Caracterización de los clústeres
                    </div>
                    <Table
                      columns={[
                        {
                          title: "Clúster",
                          dataIndex: "cluster",
                          key: "cluster",
                          width: "15%",
                          render: (value) => (
                            <span style={{ fontWeight: "600", color: "#333" }}>
                              {value}
                            </span>
                          ),
                        },
                        {
                          title: "N° Hospitales",
                          dataIndex: "n_hospitales",
                          key: "n_hospitales",
                          width: "20%",
                          render: (value) => (
                            <span style={{ color: "#1890ff" }}>{value}</span>
                          ),
                        },
                        {
                          title: "ET Media",
                          dataIndex: "te_media",
                          key: "te_media",
                          width: "20%",
                          render: (value) => (
                            <span style={{ color: "#52c41a" }}>
                              {value.toFixed(2)}
                            </span>
                          ),
                        },
                        {
                          title: "Media PC1",
                          dataIndex: "pc1_media",
                          key: "pc1_media",
                          width: "22%",
                          render: (value) => (
                            <span
                              style={{
                                color: value < 0 ? "#ff4d4f" : "#52c41a",
                              }}
                            >
                              {value.toFixed(2)}
                            </span>
                          ),
                        },
                        {
                          title: "Media PC2",
                          dataIndex: "pc2_media",
                          key: "pc2_media",
                          width: "23%",
                          render: (value) => (
                            <span
                              style={{
                                color: value < 0 ? "#ff4d4f" : "#52c41a",
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
                          cluster: 0,
                          n_hospitales: 34,
                          te_media: 0.35,
                          pc1_media: -8.97,
                          pc2_media: 0.09,
                        },
                        {
                          key: 2,
                          cluster: 1,
                          n_hospitales: 17,
                          te_media: 0.3,
                          pc1_media: 1.94,
                          pc2_media: -9.48,
                        },
                      ]}
                      pagination={false}
                      size="small"
                      scroll={{ y: "calc(50% - 40px)" }}
                      style={{ flex: 1 }}
                    />
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

export default PcaClusterView;
