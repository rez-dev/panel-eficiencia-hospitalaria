import React from "react";
import { Card, Tag, Space, Button, Tooltip } from "antd";
import {
  SettingOutlined,
  ClearOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useGlobalState } from "../contexts/GlobalStateContext";

const StateIndicator = ({ showActions = true }) => {
  const { state, actions } = useGlobalState();

  const { inputcols, outputcols, año, metodologia, hospitalesSeleccionados } =
    state;

  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "1px solid #e6f7ff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space size="small" wrap>
          <Space size="small">
            <SettingOutlined style={{ color: "#1890ff" }} />
            <strong>Estado Actual:</strong>
          </Space>

          <Tag color="blue">{metodologia}</Tag>
          <Tag color="green">{año}</Tag>

          {inputcols.length > 0 && (
            <Tag color="orange">{inputcols.length} inputs</Tag>
          )}

          {outputcols.length > 0 && (
            <Tag color="purple">{outputcols.length} outputs</Tag>
          )}

          {hospitalesSeleccionados.length > 0 && (
            <Tag color="gold">
              {hospitalesSeleccionados.length} para comparar
            </Tag>
          )}
        </Space>{" "}
        {showActions && hospitalesSeleccionados.length > 0 && (
          <Tooltip title="Limpiar selecciones para comparación">
            <Button
              size="small"
              type="text"
              icon={<ClearOutlined />}
              onClick={() => actions.clearHospitalesSeleccionados()}
            />
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default StateIndicator;
