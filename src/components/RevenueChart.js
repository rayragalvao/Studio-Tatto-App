import React, { useState, useRef } from 'react';
import { View, Text, PanResponder } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { styles } from '../screens/DashboardScreen.styles';

export default function RevenueChart({ data }) {
  const [width, setWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);

  const height = 160;
  const paddingLeft = 36;
  const paddingBottom = 20;
  const paddingTop = 12;

  const maxValue = Math.max(...data.map((d) => d.valor)) * 1.15;
  const chartWidth = Math.max(width - paddingLeft, 0);
  const chartHeight = height - paddingBottom - paddingTop;

  const points = data.map((item, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (item.valor / maxValue) * chartHeight;
    return { x, y, ...item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const gridValues = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];
  const selectedPoint = points[selectedIndex];

  // Descobre o ponto mais próximo do toque com base na posição x
  const updateSelectedFromTouch = (touchX) => {
    if (chartWidth <= 0) return;
    const relativeX = touchX - paddingLeft;
    const step = chartWidth / (data.length - 1);
    let index = Math.round(relativeX / step);
    index = Math.max(0, Math.min(data.length - 1, index));
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
        console.log('[RevenueChart] toque iniciado em x =', evt.nativeEvent.locationX);
        updateSelectedFromTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        console.log('[RevenueChart] movendo em x =', evt.nativeEvent.locationX);
        updateSelectedFromTouch(evt.nativeEvent.locationX);
      },
    })
  ).current;

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
                top: Math.max(selectedPoint.y - 46, 0),
              },
            ]}
          >
            <Text style={styles.chartTooltipMonth}>{selectedPoint.mes}</Text>
            <Text style={styles.chartTooltipValue}>
              Faturamento: R$ {selectedPoint.valor.toLocaleString('pt-BR')}
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