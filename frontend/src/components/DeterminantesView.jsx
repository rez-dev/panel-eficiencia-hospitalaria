import React, { useState, useEffect } from "react";
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
  message,
  Spin,
} from "antd";

const { Content, Sider } = Layout;
const { Title } = Typography;

const DeterminantesView = ({ onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [selectedVariable, setSelectedVariable] = useState("eficiencia");
  const [calculationMethod, setCalculationMethod] = useState("SFA");
  const [selectedInputs, setSelectedInputs] = useState([
    "remuneraciones",
    "bienesyservicios",
  ]);
  const [selectedOutputs, setSelectedOutputs] = useState(["consultas"]);
  const [selectedIndependentVars, setSelectedIndependentVars] = useState([
    "remuneraciones",
    "complejidad",
  ]);
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Variables disponibles para el análisis
  const variablesDisponibles = [
    { value: "remuneraciones", label: "Remuneraciones" },
    { value: "bienesyservicios", label: "Bienes y Servicios" },
    { value: "consultas", label: "Consultas" },
    { value: "grdxegresos", label: "GRD x Egresos" },
    { value: "diascamadisponibles", label: "Días Cama Disponibles" },
    { value: "consultasurgencias", label: "Consultas Urgencias" },
    { value: "examenes", label: "Exámenes" },
    { value: "quirofanos", label: "Quirófanos" },
    { value: "complejidad", label: "Complejidad" },
  ];

  const inputVariables = variablesDisponibles.filter((v) =>
    [
      "remuneraciones",
      "bienesyservicios",
      "diascamadisponibles",
      "quirofanos",
    ].includes(v.value)
  );

  const outputVariables = variablesDisponibles.filter((v) =>
    ["consultas", "grdxegresos", "consultasurgencias", "examenes"].includes(
      v.value
    )
  );

  // Efecto para ajustar outputs cuando cambia el método
  useEffect(() => {
    if (calculationMethod === "SFA" && selectedOutputs.length > 1) {
      // SFA solo permite un output, mantener solo el primero
      setSelectedOutputs([selectedOutputs[0]]);
    }
  }, [calculationMethod, selectedOutputs]);

  // Función para realizar el análisis de determinantes
  const handleCalculateAnalysis = async () => {
    try {
      setLoading(true);

      // Validaciones
      if (selectedInputs.length === 0) {
        message.error("Debe seleccionar al menos una variable de entrada");
        return;
      }
      if (selectedOutputs.length === 0) {
        message.error("Debe seleccionar al menos una variable de salida");
        return;
      }
      if (selectedIndependentVars.length === 0) {
        message.error("Debe seleccionar al menos una variable independiente");
        return;
      }

      // Construcción de la URL con parámetros
      const params = new URLSearchParams({
        method: calculationMethod,
        year: selectedYear.toString(),
        input_cols: selectedInputs.join(","),
        output_cols: selectedOutputs.join(","),
        independent_vars: selectedIndependentVars.join(","),
      });

      const response = await fetch(
        `http://localhost:8000/determinantes-efficiency?${params}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data); // Debug
      setAnalysisResults(data);
      message.success("Análisis completado exitosamente");
    } catch (error) {
      console.error("Error al calcular análisis:", error);
      message.error(`Error al calcular el análisis: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
              <Button
                type="text"
                icon={<SearchOutlined />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#52c41a",
                }}
                title="Variables de Entrada"
              />
              <Button
                type="text"
                icon={<EditFilled />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#f5222d",
                }}
                title="Variables de Salida"
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
                value={selectedIndependentVars}
                onChange={setSelectedIndependentVars}
                style={{ width: "100%", marginBottom: "16px" }}
                options={variablesDisponibles}
              />
              {/* Variables de Entrada (Inputs) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <SearchOutlined
                  style={{
                    fontSize: "16px",
                    color: "#52c41a",
                    marginRight: "8px",
                  }}
                />
                <Title level={5} style={{ margin: 0, color: "#333" }}>
                  Variables de Entrada (Inputs)
                </Title>
              </div>
              <Select
                mode="multiple"
                placeholder="Seleccionar inputs para SFA/DEA"
                value={selectedInputs}
                onChange={setSelectedInputs}
                style={{ width: "100%", marginBottom: "16px" }}
                options={inputVariables}
              />
              {/* Variables de Salida (Outputs) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <EditFilled
                  style={{
                    fontSize: "16px",
                    color: "#f5222d",
                    marginRight: "8px",
                  }}
                />
                <Title level={5} style={{ margin: 0, color: "#333" }}>
                  Variables de Salida (Outputs)
                </Title>
              </div>
              <Select
                mode="multiple"
                placeholder="Seleccionar outputs para SFA/DEA"
                value={selectedOutputs}
                onChange={setSelectedOutputs}
                style={{ width: "100%", marginBottom: "16px" }}
                options={outputVariables}
                maxCount={calculationMethod === "SFA" ? 1 : undefined}
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
                loading={loading}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                }}
                onClick={handleCalculateAnalysis}
              >
                {loading ? "Calculando..." : "Calcular"}
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
                  { value: 2014, label: "2014" },
                  { value: 2015, label: "2015" },
                  { value: 2016, label: "2016" },
                  { value: 2017, label: "2017" },
                  { value: 2018, label: "2018" },
                  { value: 2019, label: "2019" },
                  { value: 2020, label: "2020" },
                  { value: 2021, label: "2021" },
                  { value: 2022, label: "2022" },
                  { value: 2023, label: "2023" },
                ]}
              />
              <Radio.Group
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value)}
                size="middle"
              >
                <Radio.Button value="SFA">SFA</Radio.Button>
                <Radio.Button value="DEA">DEA</Radio.Button>
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
                    value={analysisResults?.r_cuadrado || "--"}
                    precision={analysisResults?.r_cuadrado ? 3 : 0}
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
                    value={analysisResults?.variables_clave?.length || "--"}
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
                    value={analysisResults?.observaciones || "--"}
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
                        render: (value) =>
                          typeof value === "number" ? value.toFixed(4) : value,
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
                            {typeof value === "number"
                              ? value.toFixed(3)
                              : value}
                          </span>
                        ),
                      },
                      {
                        title: "Error estándar",
                        dataIndex: "errorEstandar",
                        key: "errorEstandar",
                        width: "18%",
                        render: (value) =>
                          typeof value === "number" ? value.toFixed(4) : value,
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
                            {typeof value === "number"
                              ? value.toFixed(2)
                              : value}
                          </span>
                        ),
                      },
                    ]}
                    dataSource={
                      // Solo mostrar datos si hay resultados reales del backend
                      analysisResults?.coeficientes &&
                      analysisResults.coeficientes.length > 0
                        ? analysisResults.coeficientes.map((data, index) => ({
                            key: index + 1,
                            variable: data.variable,
                            coeficiente: data.coeficiente,
                            pvalor: data.p_value,
                            errorEstandar: data.error_estandar,
                            vif: data.vif || 0, // VIF no está en la respuesta actual
                          }))
                        : [] // Tabla vacía si no hay resultados
                    }
                    pagination={false}
                    size="small"
                    scroll={{ y: "calc(100% - 80px)" }}
                    style={{ flex: 1 }}
                    locale={{
                      emptyText: analysisResults
                        ? "No se encontraron coeficientes en los resultados del análisis."
                        : "Selecciona las variables y haz clic en 'Calcular' para ver los resultados del análisis econométrico",
                    }}
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
                    <strong>Estadísticas del modelo:</strong>
                    R² = {analysisResults?.r_cuadrado?.toFixed(3) || "--"} | R²
                    ajustado ={" "}
                    {analysisResults?.r_cuadrado_ajustado?.toFixed(3) || "--"} |
                    Variables significativas ={" "}
                    {analysisResults?.variables_clave?.length || "--"}
                    <br />
                    <strong>Método de eficiencia:</strong>{" "}
                    {analysisResults?.metodo_eficiencia || calculationMethod} |
                    <strong>Año:</strong> {selectedYear} |
                    <strong>Variable dependiente:</strong>{" "}
                    {analysisResults?.variable_dependiente ||
                      "Eficiencia Técnica"}
                    <br />
                    <strong>Observaciones:</strong>{" "}
                    {analysisResults?.observaciones || "--"} |
                    <strong>Mensaje:</strong>{" "}
                    {analysisResults?.mensaje || "Análisis pendiente"}
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
