import React from "react";
import { Tooltip, Typography } from "antd";
import { QuestionCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

/**
 * Función para formatear nombres de variables técnicas a formato legible
 */
const formatVariableName = (variableName) => {
  const formatMap = {
    // Variables de entrada
    bienesyservicios: "Bienes y Servicios",
    remuneraciones: "Remuneraciones",
    diascamadisponibles: "Días de Cama Disponibles",

    // Variables de salida
    consultas: "Consultas",
    grdxegresos: "Egresos por GRD",
    consultasurgencias: "Consultas de Urgencia",
    examenes: "Exámenes",
    quirofanos: "Quirófanos",

    // Metodologías
    SFA: "SFA (Análisis de Frontera Estocástica)",
    DEA: "DEA (Análisis Envolvente de Datos)",
    "DEA-M": "DEA-M (Índice Malmquist)",
  };

  return (
    formatMap[variableName] ||
    variableName.charAt(0).toUpperCase() + variableName.slice(1)
  );
};

/**
 * Componente reutilizable para mostrar tooltips informativos
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del tooltip
 * @param {string} props.content - Contenido principal del tooltip
 * @param {Object} props.details - Detalles adicionales (opcional)
 * @param {Object} props.options - Opciones específicas (opcional)
 * @param {Object} props.niveles - Niveles de clasificación (opcional)
 * @param {string} props.placement - Posición del tooltip (top, bottom, left, right)
 * @param {string} props.icon - Tipo de icono (question, info)
 * @param {Object} props.iconStyle - Estilos personalizados para el icono
 * @param {number} props.maxWidth - Ancho máximo del tooltip
 * @param {boolean} props.arrow - Mostrar flecha del tooltip
 */
const CustomTooltip = ({
  title,
  content,
  details = null,
  options = null,
  niveles = null,
  placement = "top",
  icon = "question",
  iconStyle = {},
  maxWidth = 350,
  arrow = true,
  children,
}) => {
  // Función para renderizar el contenido del tooltip
  const renderTooltipContent = () => {
    return (
      <div style={{ maxWidth: maxWidth }}>
        {title && (
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              fontSize: "14px",
              color: "#333",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              paddingBottom: "6px",
            }}
          >
            {title}
          </div>
        )}

        {content && (
          <div
            style={{
              marginBottom: details || options || niveles ? "12px" : "0",
              lineHeight: "1.5",
              fontSize: "13px",
              color: "#666",
            }}
          >
            {content}
          </div>
        )}

        {/* Renderizar detalles específicos */}
        {details && (
          <div style={{ marginBottom: "8px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#999",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Detalles:
            </div>
            {Object.entries(details).map(([key, value]) => (
              <div
                key={key}
                style={{
                  marginBottom: "10px",
                  padding: "6px",
                  backgroundColor: "rgba(24, 144, 255, 0.08)",
                  borderRadius: "4px",
                  borderLeft: "3px solid #1890ff",
                }}
              >
                <Text strong style={{ color: "#1890ff", fontSize: "12px" }}>
                  {key}
                </Text>
                <div
                  style={{
                    fontSize: "11px",
                    lineHeight: "1.4",
                    marginTop: "4px",
                    color: "#666",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Renderizar opciones */}
        {options && (
          <div style={{ marginBottom: "8px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#999",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Opciones disponibles:
            </div>
            {Object.entries(options).map(([key, value]) => (
              <div
                key={key}
                style={{
                  marginBottom: "10px",
                  padding: "6px",
                  backgroundColor: "rgba(24, 144, 255, 0.08)",
                  borderRadius: "4px",
                  borderLeft: "3px solid #1890ff",
                }}
              >
                <Text strong style={{ color: "#1890ff", fontSize: "12px" }}>
                  {formatVariableName(key)}
                </Text>
                <div
                  style={{
                    fontSize: "11px",
                    lineHeight: "1.4",
                    marginTop: "4px",
                    color: "#666",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Renderizar niveles */}
        {niveles && (
          <div>
            {Object.entries(niveles).map(([key, value]) => (
              <div
                key={key}
                style={{
                  marginBottom: "4px",
                  fontSize: "11px",
                  lineHeight: "1.4",
                }}
              >
                {value}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Seleccionar el icono apropiado
  const IconComponent =
    icon === "info" ? InfoCircleOutlined : QuestionCircleOutlined;

  // Estilos por defecto del icono
  const defaultIconStyle = {
    color: "#1890ff",
    fontSize: "14px",
    marginLeft: "6px",
    cursor: "help",
    ...iconStyle,
  };

  return (
    <Tooltip
      title={renderTooltipContent()}
      placement={placement}
      arrow={arrow}
      overlayStyle={{
        maxWidth: maxWidth + 40,
      }}
      overlayInnerStyle={{
        backgroundColor: "#fff",
        color: "#333",
        fontSize: "13px",
        lineHeight: "1.5",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e8e8e8",
      }}
    >
      {children || <IconComponent style={defaultIconStyle} />}
    </Tooltip>
  );
};

/**
 * Wrapper específico para tooltips de parámetros
 */
export const ParameterTooltip = ({ tooltipData, ...props }) => {
  if (!tooltipData) return null;

  return (
    <CustomTooltip
      title={tooltipData.title}
      content={tooltipData.content}
      details={tooltipData.details}
      options={tooltipData.options}
      {...props}
    />
  );
};

/**
 * Wrapper específico para tooltips de KPIs
 */
export const KpiTooltip = ({ tooltipData, ...props }) => {
  if (!tooltipData) return null;

  return (
    <CustomTooltip
      title={tooltipData.title}
      content={tooltipData.content}
      icon="info"
      placement="top"
      {...props}
    />
  );
};

/**
 * Wrapper específico para tooltips de acciones
 */
export const ActionTooltip = ({ tooltipData, children, ...props }) => {
  if (!tooltipData) return children;

  return (
    <CustomTooltip
      title={tooltipData.title}
      content={tooltipData.content}
      placement="bottom"
      {...props}
    >
      {children}
    </CustomTooltip>
  );
};

/**
 * Wrapper específico para tooltips de columnas de tabla
 */
export const ColumnTooltip = ({ tooltipData, children, ...props }) => {
  if (!tooltipData) return children;

  return (
    <CustomTooltip
      title={tooltipData.title}
      content={tooltipData.content}
      icon="info"
      placement="top"
      maxWidth={280}
      iconStyle={{ fontSize: "12px", marginLeft: "4px" }}
      {...props}
    >
      {children}
    </CustomTooltip>
  );
};

export default CustomTooltip;
