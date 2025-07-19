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
  InfoCircleOutlined,
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
  Switch,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
} from "recharts";
import CustomTooltip, {
  ParameterTooltip,
  KpiTooltip,
  ActionTooltip,
  ColumnTooltip,
} from "./CustomTooltip";
import { getTooltip } from "../data/tooltips";
import ApiService from "../services/api";
import { useGlobalState } from "../contexts/GlobalStateContext";

const { Content, Sider } = Layout;
const { Title } = Typography;

// Función utilitaria para formatear números con separador de miles (punto) y decimales con coma
const formatNumber = (value, decimals = 1) => {
  if (typeof value === "number" && !isNaN(value)) {
    return value.toLocaleString("es-CL", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  if (typeof value === "string" && value !== "") {
    const num = Number(value);
    if (!isNaN(num)) {
      return num.toLocaleString("es-CL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
  }
  return value;
};

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
    "letalidad",
    "indiceocupacional",
    "complejidad",
    "indicerotacion",
  ]);
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const { state, actions } = useGlobalState();
  const [normalizeChart, setNormalizeChart] = useState(true);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Función para formatear nombres de variables
  const formatVariableName = (variable) => {
    const variableMap = {
      remuneraciones: "Remuneraciones",
      bienesyservicios: "Bienes y Servicios",
      consultas: "Consultas",
      grdxegresos: "GRD x Egresos",
      diascamadisponibles: "Días Cama Disponibles",
      consultasurgencias: "Consultas Urgencias",
      examenes: "Exámenes",
      quirofanos: "Quirófanos",
      complejidad: "Complejidad",
      indiceocupacional: "Índice Ocupacional",
      indicerotacion: "Índice de Rotación",
      promediodiasestadia: "Promedio Días Estadía",
      letalidad: "Letalidad",
      egresosfallecidos: "Egresos Fallecidos",
      const: "Constante",
      intercept: "Intercepto",
    };

    return (
      variableMap[variable] ||
      variable.charAt(0).toUpperCase() + variable.slice(1)
    );
  };

  // Función para preparar datos del gráfico de barras
  const prepareChartData = (coeficientes, topN = 5, normalizeData = true) => {
    if (!coeficientes || coeficientes.length === 0) return [];

    // Filtrar variables (excluir constante)
    const filteredCoef = coeficientes.filter(
      (item) => item.variable !== "const" && item.variable !== "intercept"
    );

    // Calcular valor absoluto y ordenar por magnitud
    const sortedCoef = filteredCoef
      .map((item) => ({
        ...item,
        abs_coef: Math.abs(item.coeficiente || 0),
      }))
      .sort((a, b) => b.abs_coef - a.abs_coef)
      .slice(0, topN);

    // Normalizar datos si está habilitado
    let processedData = [...sortedCoef];
    if (normalizeData && sortedCoef.length > 0) {
      // Encontrar el valor máximo absoluto para normalizar
      const maxAbsValue = Math.max(
        ...sortedCoef.map((item) => Math.abs(item.coeficiente || 0))
      );

      if (maxAbsValue > 0) {
        processedData = sortedCoef.map((item) => ({
          ...item,
          coeficiente_original: item.coeficiente,
          coeficiente: (item.coeficiente || 0) / maxAbsValue, // Normalizar a [-1, 1]
        }));
      }
    }

    // Preparar datos para Recharts
    return processedData.map((item) => ({
      name: formatVariableName(item.variable),
      coeficiente: item.coeficiente || 0,
      coeficiente_original: item.coeficiente_original || item.coeficiente,
      pValue: item.p_value || 1,
      isSignificant: (item.p_value || 1) < 0.05,
      originalVariable: item.variable,
      isNormalized: normalizeData,
    }));
  };

  // Variables disponibles para análisis independientes (para determinantes)
  const variablesDisponibles = [
    { value: "complejidad", label: "Complejidad" },
    { value: "indiceocupacional", label: "Índice Ocupacional" },
    { value: "indicerotacion", label: "Índice de Rotación" },
    { value: "promediodiasestadia", label: "Promedio Días Estadía" },
    { value: "letalidad", label: "Letalidad" },
    { value: "egresosfallecidos", label: "Egresos Fallecidos" },
  ];

  // Variables de entrada (inputs) para SFA/DEA
  const inputVariables = [
    { value: "remuneraciones", label: "Remuneraciones" },
    { value: "bienesyservicios", label: "Bienes y Servicios" },
    { value: "diascamadisponibles", label: "Días Cama Disponibles" },
  ];

  // Variables de salida (outputs) para SFA/DEA
  const outputVariables = [
    { value: "consultas", label: "Consultas" },
    { value: "grdxegresos", label: "GRD x Egresos" },
    { value: "consultasurgencias", label: "Consultas Urgencias" },
    { value: "examenes", label: "Exámenes" },
    { value: "quirofanos", label: "Quirófanos" },
  ];

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

      // Usar ApiService en lugar de fetch hardcodeado
      const data = await ApiService.fetchDeterminantesEfficiency(
        calculationMethod,
        selectedYear,
        selectedInputs,
        selectedOutputs,
        selectedIndependentVars
      );

      console.log("Respuesta del backend:", data); // Debug
      setAnalysisResults(data);
      actions.setResultadosDeterminantes(data);
      message.success("Análisis completado exitosamente");
    } catch (error) {
      console.error("Error al calcular análisis:", error);
      message.error(`Error al calcular el análisis: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Restaurar resultados guardados al montar la vista
  useEffect(() => {
    if (
      state.resultadosDeterminantes &&
      Object.keys(state.resultadosDeterminantes).length > 0
    ) {
      setAnalysisResults(state.resultadosDeterminantes);
    }
  }, [state.resultadosDeterminantes]);

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
                icon={<EditFilled />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#1890ff",
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
                  color: "#52c41a",
                }}
                title="Variables de Salida"
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "4px",
                  marginBottom: "20px",
                  borderBottom: "1px solid #e8e8e8",
                  paddingBottom: "12px",
                }}
              >
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "determinantes",
                    "secciones",
                    "parametrosCalculo"
                  )}
                >
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: "#333",
                      cursor: "help",
                    }}
                  >
                    Parámetros de Cálculo
                  </Title>
                </ParameterTooltip>
              </div>{" "}
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
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "determinantes",
                    "secciones",
                    "variablesIndependientes"
                  )}
                >
                  <Title
                    level={5}
                    style={{ margin: 0, color: "#333", cursor: "help" }}
                  >
                    Variables Independientes
                  </Title>
                </ParameterTooltip>
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
                <EditFilled
                  style={{
                    fontSize: "16px",
                    color: "#1890ff",
                    marginRight: "8px",
                  }}
                />
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "determinantes",
                    "parametros",
                    "entradas"
                  )}
                >
                  <Title
                    level={5}
                    style={{ margin: 0, color: "#333", cursor: "help" }}
                  >
                    Entradas
                  </Title>
                </ParameterTooltip>
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
                    color: "#52c41a",
                    marginRight: "8px",
                  }}
                />
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "determinantes",
                    "parametros",
                    "salidas"
                  )}
                >
                  <Title
                    level={5}
                    style={{ margin: 0, color: "#333", cursor: "help" }}
                  >
                    Salidas
                  </Title>
                </ParameterTooltip>
              </div>
              <Select
                mode="multiple"
                placeholder="Seleccionar outputs para SFA/DEA"
                value={selectedOutputs}
                onChange={setSelectedOutputs}
                style={{ width: "100%", marginBottom: "16px" }}
                options={outputVariables}
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
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "determinantes",
                    "secciones",
                    "variableDependiente"
                  )}
                >
                  <Title
                    level={5}
                    style={{ margin: 0, color: "#333", cursor: "help" }}
                  >
                    Variable Dependiente
                  </Title>
                </ParameterTooltip>
              </div>{" "}
              <Select
                placeholder="Variable a explicar"
                value={selectedVariable}
                onChange={setSelectedVariable}
                disabled={true}
                style={{ width: "100%", marginBottom: "16px" }}
                options={[{ value: "eficiencia", label: "Eficiencia Técnica" }]}
              />
              <ActionTooltip
                tooltipData={getTooltip(
                  "determinantes",
                  "acciones",
                  "calcular"
                )}
              >
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
              </ActionTooltip>
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
              <ParameterTooltip
                tooltipData={getTooltip("determinantes", "parametros", "año")}
              >
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
              </ParameterTooltip>
              <ParameterTooltip
                tooltipData={getTooltip(
                  "determinantes",
                  "parametros",
                  "metodologia"
                )}
              >
                <Radio.Group
                  value={calculationMethod}
                  onChange={(e) => setCalculationMethod(e.target.value)}
                  size="middle"
                >
                  <Radio.Button value="SFA">SFA</Radio.Button>
                  <Radio.Button value="DEA">DEA</Radio.Button>
                </Radio.Group>
              </ParameterTooltip>
            </div>
          </div>{" "}
          {/* KPI Cards */}
          <div style={{ width: "100%", maxWidth: "1200px" }}>
            <Row
              gutter={[16, 16]}
              style={{ marginBottom: "8px", justifyContent: "center" }}
            >
              <Col xs={24} sm={8} md={8}>
                <KpiTooltip
                  tooltipData={getTooltip("determinantes", "kpis", "rCuadrado")}
                >
                  <Card
                    style={{
                      textAlign: "center",
                      height: "100px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                      border: "1px solid #91d5ff",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "help",
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <LineChartOutlined />
                          R²
                        </span>
                      }
                      value={
                        analysisResults?.r_cuadrado !== undefined
                          ? formatNumber(analysisResults.r_cuadrado, 3)
                          : "--"
                      }
                      precision={analysisResults?.r_cuadrado ? 3 : 0}
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </KpiTooltip>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <KpiTooltip
                  tooltipData={getTooltip(
                    "determinantes",
                    "kpis",
                    "variablesSignificativas"
                  )}
                >
                  <Card
                    style={{
                      textAlign: "center",
                      height: "100px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                      border: "1px solid #91d5ff",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "help",
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <TrophyOutlined />β significativos
                        </span>
                      }
                      value={
                        analysisResults?.variables_clave?.length !== undefined
                          ? formatNumber(
                              analysisResults.variables_clave.length,
                              0
                            )
                          : "--"
                      }
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </KpiTooltip>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <KpiTooltip
                  tooltipData={getTooltip(
                    "determinantes",
                    "kpis",
                    "observaciones"
                  )}
                >
                  <Card
                    style={{
                      textAlign: "center",
                      height: "100px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                      border: "1px solid #91d5ff",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "help",
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <TeamOutlined />
                          N° Observaciones
                        </span>
                      }
                      value={
                        analysisResults?.observaciones !== undefined
                          ? formatNumber(analysisResults.observaciones, 0)
                          : "--"
                      }
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </KpiTooltip>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 10,
                  margin: 0,
                  textAlign: "left",
                }}
              >
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "determinantes",
                    "secciones",
                    "resultados"
                  )}
                >
                  <Title
                    level={4}
                    style={{ margin: 0, marginRight: "8px", cursor: "help" }}
                  >
                    Variables y Factores Determinantes
                  </Title>
                </ParameterTooltip>
              </div>
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <ParameterTooltip
                        tooltipData={getTooltip(
                          "determinantes",
                          "grafico",
                          "titulo"
                        )}
                      >
                        <Title
                          level={5}
                          style={{
                            marginTop: "0px",
                            marginBottom: "0px",
                            textAlign: "center",
                            cursor: "help",
                          }}
                        >
                          Top 5 Determinantes de Eficiencia
                        </Title>
                      </ParameterTooltip>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        Normalizar:
                      </span>
                      <CustomTooltip
                        title={
                          getTooltip(
                            "determinantes",
                            "grafico",
                            "normalizacion"
                          )?.title
                        }
                        content={
                          getTooltip(
                            "determinantes",
                            "grafico",
                            "normalizacion"
                          )?.content
                        }
                      >
                        <Switch
                          size="small"
                          checked={normalizeChart}
                          onChange={setNormalizeChart}
                          title=""
                        />
                      </CustomTooltip>
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {analysisResults?.coeficientes &&
                    analysisResults.coeficientes.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={prepareChartData(
                            analysisResults.coeficientes,
                            5,
                            normalizeChart
                          )}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                            fontSize={11}
                          />
                          <YAxis
                            domain={
                              normalizeChart
                                ? [-1.1, 1.1]
                                : ["dataMin - 0.005", "dataMax + 0.005"]
                            }
                            tickFormatter={(value) => {
                              if (normalizeChart) {
                                return value.toFixed(2);
                              }
                              if (Math.abs(value) < 0.001 && value !== 0) {
                                return value.toExponential(2);
                              }
                              return value.toFixed(4);
                            }}
                          />
                          <Tooltip
                            formatter={(value, name, props) => {
                              const { payload } = props;
                              const normalizedValue =
                                Math.abs(value) < 0.001 && value !== 0
                                  ? value.toExponential(4)
                                  : value.toFixed(4);

                              if (
                                normalizeChart &&
                                payload.coeficiente_original !== undefined &&
                                payload.coeficiente_original !==
                                  payload.coeficiente
                              ) {
                                const originalValue =
                                  Math.abs(payload.coeficiente_original) <
                                    0.001 && payload.coeficiente_original !== 0
                                    ? payload.coeficiente_original.toExponential(
                                        4
                                      )
                                    : payload.coeficiente_original.toFixed(4);
                                return [
                                  `Normalizado: ${normalizedValue}`,
                                  `Original: ${originalValue}`,
                                ];
                              }
                              return [normalizedValue, "Coeficiente"];
                            }}
                            labelFormatter={(label) => `Variable: ${label}`}
                            separator=" | "
                          />
                          <ReferenceLine y={0} stroke="#000" />
                          <Bar
                            dataKey="coeficiente"
                            fill="#8884d8"
                            name="Coeficiente"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ textAlign: "center", color: "#666" }}>
                        <LineChartOutlined
                          style={{
                            fontSize: "48px",
                            marginBottom: "16px",
                            color: "#1890ff",
                          }}
                        />
                        <div style={{ fontSize: "16px", fontWeight: "500" }}>
                          Gráfico de Determinantes
                        </div>
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
                          Ejecuta el análisis para ver los determinantes
                          principales
                        </div>
                      </div>
                    )}
                  </div>
                  {analysisResults?.coeficientes &&
                    analysisResults.coeficientes.length > 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "8px 12px",
                          background: "#f6f8fa",
                          borderRadius: "4px",
                          fontSize: "11px",
                          color: "#666",
                          borderTop: "1px solid #e1e4e8",
                        }}
                      >
                        {normalizeChart ? (
                          <>
                            <strong>Valores normalizados:</strong> Los
                            coeficientes están escalados a [-1, 1] para
                            facilitar la comparación. Pasa el cursor sobre las
                            barras para ver los valores originales.
                          </>
                        ) : (
                          <>
                            <strong>Valores originales:</strong> Los
                            coeficientes se muestran en su escala original del
                            modelo econométrico.
                          </>
                        )}
                      </div>
                    )}
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "0px",
                      marginBottom: "12px",
                      gap: "8px",
                    }}
                  >
                    <ParameterTooltip
                      tooltipData={getTooltip(
                        "determinantes",
                        "tabla",
                        "estadisticas",
                        "titulo"
                      )}
                    >
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          textAlign: "center",
                          cursor: "help",
                        }}
                      >
                        Resultados del Análisis Econométrico
                      </Title>
                    </ParameterTooltip>
                  </div>{" "}
                  <Table
                    columns={[
                      {
                        title: (
                          <ColumnTooltip
                            tooltipData={getTooltip(
                              "determinantes",
                              "tabla",
                              "columnas",
                              "variable"
                            )}
                          >
                            <span style={{ cursor: "help" }}>Variable</span>
                          </ColumnTooltip>
                        ),
                        dataIndex: "variable",
                        key: "variable",
                        width: "30%",
                        render: (value) => formatVariableName(value),
                      },
                      {
                        title: (
                          <ColumnTooltip
                            tooltipData={getTooltip(
                              "determinantes",
                              "tabla",
                              "columnas",
                              "coeficiente"
                            )}
                          >
                            <span style={{ cursor: "help" }}>Coeficiente</span>
                          </ColumnTooltip>
                        ),
                        dataIndex: "coeficiente",
                        key: "coeficiente",
                        width: "20%",
                        render: (value) => {
                          if (typeof value !== "number") return value;
                          if (Math.abs(value) < 0.001 && value !== 0) {
                            const [mantissa, exponent] = value
                              .toExponential(3)
                              .split("e");
                            return `${mantissa.replace(".", ",")}e${exponent}`;
                          }
                          return formatNumber(value, 4);
                        },
                      },
                      {
                        title: (
                          <ColumnTooltip
                            tooltipData={getTooltip(
                              "determinantes",
                              "tabla",
                              "columnas",
                              "errorEstandar"
                            )}
                          >
                            <span style={{ cursor: "help" }}>
                              Error Estándar
                            </span>
                          </ColumnTooltip>
                        ),
                        dataIndex: "errorEstandar",
                        key: "errorEstandar",
                        width: "20%",
                        render: (value) => {
                          if (typeof value !== "number") return value;
                          if (Math.abs(value) < 0.001 && value !== 0) {
                            const [mantissa, exponent] = value
                              .toExponential(3)
                              .split("e");
                            return `${mantissa.replace(".", ",")}e${exponent}`;
                          }
                          return formatNumber(value, 4);
                        },
                      },
                      {
                        title: (
                          <ColumnTooltip
                            tooltipData={getTooltip(
                              "determinantes",
                              "tabla",
                              "columnas",
                              "tStatistic"
                            )}
                          >
                            <span style={{ cursor: "help" }}>
                              Estadístico t
                            </span>
                          </ColumnTooltip>
                        ),
                        dataIndex: "tStatistic",
                        key: "tStatistic",
                        width: "15%",
                        render: (value) =>
                          typeof value === "number"
                            ? formatNumber(value, 3)
                            : value,
                      },
                      {
                        title: (
                          <ColumnTooltip
                            tooltipData={getTooltip(
                              "determinantes",
                              "tabla",
                              "columnas",
                              "pValor"
                            )}
                          >
                            <span style={{ cursor: "help" }}>P-Valor</span>
                          </ColumnTooltip>
                        ),
                        dataIndex: "pvalor",
                        key: "pvalor",
                        width: "15%",
                        render: (value) => {
                          if (typeof value !== "number") return value;

                          let formattedValue;
                          if (Math.abs(value) < 0.001 && value !== 0) {
                            const [mantissa, exponent] = value
                              .toExponential(3)
                              .split("e");
                            formattedValue = `${mantissa.replace(
                              ".",
                              ","
                            )}e${exponent}`;
                          } else {
                            formattedValue = formatNumber(value, 3);
                          }

                          // Agregar símbolos de significancia
                          let significance = "";
                          if (value < 0.001) {
                            significance = " ***";
                          } else if (value < 0.01) {
                            significance = " **";
                          } else if (value < 0.05) {
                            significance = " *";
                          }

                          return (
                            <span
                              style={{
                                color: value < 0.05 ? "#52c41a" : "#ff4d4f",
                              }}
                            >
                              {formattedValue}
                              {significance}
                            </span>
                          );
                        },
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
                            errorEstandar: data.error_estandar,
                            tStatistic:
                              data.t_value ||
                              (data.coeficiente && data.error_estandar
                                ? data.coeficiente / data.error_estandar
                                : null),
                            pvalor: data.p_value,
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
                  <CustomTooltip
                    title={
                      getTooltip(
                        "determinantes",
                        "tabla",
                        "estadisticas",
                        "titulo"
                      )?.title
                    }
                    content={
                      getTooltip(
                        "determinantes",
                        "tabla",
                        "estadisticas",
                        "titulo"
                      )?.content
                    }
                  >
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        background: "#f8f9fa",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#666",
                        cursor: "help",
                      }}
                    >
                      <strong>Estadísticas del modelo:</strong>
                      R² ={" "}
                      {analysisResults?.r_cuadrado !== undefined
                        ? formatNumber(analysisResults.r_cuadrado, 3)
                        : "--"}{" "}
                      | R² ajustado ={" "}
                      {analysisResults?.r_cuadrado_ajustado?.toFixed(3) || "--"}{" "}
                      | Variables significativas ={" "}
                      {analysisResults?.variables_clave?.length || "--"}
                      <br />
                      <strong>Método de eficiencia:</strong>{" "}
                      {analysisResults?.metodo_eficiencia || calculationMethod}{" "}
                      |<strong>Año:</strong> {selectedYear} |
                      <strong>Variable dependiente:</strong>{" "}
                      {analysisResults?.variable_dependiente ||
                        "Eficiencia Técnica"}
                      <br />
                      <strong>Observaciones:</strong>{" "}
                      {analysisResults?.observaciones !== undefined
                        ? formatNumber(analysisResults.observaciones, 0)
                        : "--"}{" "}
                      |<strong>Mensaje:</strong>{" "}
                      {analysisResults?.mensaje || "Análisis pendiente"}
                      <br />
                      <strong>Significancia:</strong> *** p&lt;0.001, **
                      p&lt;0.01, * p&lt;0.05, NS = No significativo
                    </div>
                  </CustomTooltip>
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
