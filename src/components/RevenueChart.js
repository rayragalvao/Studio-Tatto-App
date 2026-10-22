import React, { useState, useRef, useEffect } from 'react';
import { View, Text, PanResponder } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { styles } from '../screens/dashboard/DashboardScreen.styles';

export default function RevenueChart({ data = [] }) {
  const [width, setWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(Math.max(data.length - 1, 0));

  // Quando os dados chegam (ou mudam de tamanho), seleciona o mês mais recente.
  useEffect(() => {
    setSelectedIndex(Math.max(data.length - 1, 0));
  }, [data.length]);

  const height = 160;
  const paddingLeft = 36;
  const paddingBottom = 20;
  const paddingTop = 12;

  // Evita -Infinity (lista vazia) e divisão por zero (todos os meses zerados).
  const maxValue = (Math.max(0, ...data.map((d) => Number(d.valor) || 0)) || 1) * 1.15;
  const chartWidth = Math.max(width - paddingLeft, 0);
  const chartHeight = height - paddingBottom - paddingTop;

  const points = data.map((item, i) => {
    const x = data.length > 1
      ? paddingLeft + (i / (data.length - 1)) * chartWidth
      : paddingLeft + chartWidth / 2;
    const y = paddingTop + chartHeight - ((Number(item.valor) || 0) / maxValue) * chartHeight;
    return { x, y, ...item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const gridValues = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];
  const selectedPoint = points[selectedIndex];

  // O PanResponder é criado só uma vez (useRef), então NÃO pode depender
  // diretamente de `chartWidth`/`width` do state, senão fica preso no
  // valor do primeiro render (width = 0, antes do onLayout disparar).
  // Por isso guardamos o valor mais atual numa ref, que é mutável e
  // sempre reflete o último render, mesmo dentro de uma closure antiga.
  const chartWidthRef = useRef(chartWidth);
  chartWidthRef.current = chartWidth;
  const dataLengthRef = useRef(data.length);
  dataLengthRef.current = data.length;

  // Descobre o ponto mais próximo do toque com base na posição x
  const updateSelectedFromTouch = (touchX) => {
    const currentChartWidth = chartWidthRef.current;
    const total = dataLengthRef.current;
    if (currentChartWidth <= 0 || total === 0) return;
    if (total === 1) {
      setSelectedIndex(0);
      return;
    }
    const relativeX = touchX - paddingLeft;
    const step = currentChartWidth / (total - 1);
    let index = Math.round(relativeX / step);
    index = Math.max(0, Math.min(total - 1, index));
    setSelectedIndex(index);
  };

  const panResponder = useRef(
    PanResponder.create({
      // true nos "Capture" faz esse View interceptar o gesto
      // ANTES do ScrollView pai decidir tratar como scroll vertical
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (evt) => {
        updateSelectedFromTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        updateSelectedFromTouch(evt.nativeEvent.locationX);
      },
    })
  ).current;

  if (data.length === 0) {
    return <Text style={styles.rowSubtitle}>Sem dados de faturamento.</Text>;
  }

  return (
    <View>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {width > 0 && (
          <Svg width={width} height={height}>
            {gridValues.map((val, i) => {
              const y = paddingTop + chartHeight - (val / maxValue) * chartHeight;
              return (
                <Line
                  key={`grid-${i}`}
                  x1={paddingLeft}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke={colors.cardBorder}
                  strokeDasharray="4,4"
                  strokeWidth={1}
                />
              );
            })}

            {gridValues.map((val, i) => {
              const y = paddingTop + chartHeight - (val / maxValue) * chartHeight;
              return (
                <SvgText key={`label-${i}`} x={0} y={y + 4} fontSize={10} fill={colors.textMuted}>
                  {val >= 1000 ? `${Math.round(val / 1000)}k` : Math.round(val)}
                </SvgText>
              );
            })}

            <Polyline points={polylinePoints} fill="none" stroke={colors.primary} strokeWidth={2} />

            {selectedPoint && (
              <Line
                x1={selectedPoint.x}
                y1={paddingTop}
                x2={selectedPoint.x}
                y2={height - paddingBottom}
                stroke={colors.cardBorder}
                strokeWidth={1}
              />
            )}

            {points.map((p, i) => (
              <Circle
                key={`point-${i}`}
                cx={p.x}
                cy={p.y}
                r={i === selectedIndex ? 5 : 3}
                fill={i === selectedIndex ? colors.primary : colors.card}
                stroke={colors.primary}
                strokeWidth={2}
              />
            ))}
          </Svg>
        )}

        {selectedPoint && width > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.chartTooltip,
              {
                left: Math.min(Math.max(selectedPoint.x - 70, 0), width - 150),
                top: 0,
              },
            ]}
          >
            <View style={styles.chartTooltipHeaderRow}>
              <View style={styles.chartTooltipDot} />
              <Text style={styles.chartTooltipMonth}>{selectedPoint.mes}</Text>
            </View>
            <Text style={styles.chartTooltipValue}>
              Faturamento: R$ {Number(selectedPoint.valor || 0).toLocaleString('pt-BR')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartLabelsRow}>
        {data.map((item, i) => (
          <Text
            key={i}
            style={[
              styles.chartAxisLabel,
              i === selectedIndex && { color: colors.primary, fontWeight: '700' },
            ]}
          >
            {item.mes}
          </Text>
        ))}
      </View>
    </View>
  );
}