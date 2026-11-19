import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import { colors } from '../../theme/colors';
import { styles } from './PipelineETLScreen.styles';

const extractItems = [
  {
    icon: 'document-text-outline',
    title: 'Orçamentos',
    description: 'Aprovações e histórico de preços aceitos',
    value: '37 registros',
  },
  {
    icon: 'calendar-outline',
    title: 'Agendamentos',
    description: 'Sessões realizadas e agenda futura',
    value: '24 registros',
  },
  {
    icon: 'receipt-outline',
    title: 'Notas Fiscais',
    description: 'Documentos fiscais processados',
    value: '18 registros',
  },
  {
    icon: 'cube-outline',
    title: 'Movimentações de estoque',
    description: 'Entradas, saídas e consumo de materiais',
    value: '63 registros',
  },
];

const transformItems = [
  {
    icon: 'bar-chart-outline',
    title: 'Agregação de faturamento',
    description: 'Consolidação das receitas por período',
    status: 'Concluído',
  },
  {
    icon: 'calculator-outline',
    title: 'Cálculo de burn rate',
    description: 'Estimativa de consumo dos materiais',
    status: 'Concluído',
  },
  {
    icon: 'sparkles-outline',
    title: 'Normalização de NF (IA)',
    description: 'Padronização automática de produtos',
    status: 'Concluído',
  },
  {
    icon: 'git-branch-outline',
    title: 'Base de similaridade',
    description: 'Correlação entre descrições e produtos',
    status: 'Concluído',
  },
];

const loadItems = [
  {
    icon: 'grid-outline',
    title: 'Dashboard',
    description: 'Indicadores consolidados do estúdio',
  },
  {
    icon: 'cube-outline',
    title: 'Estoque',
    description: 'Saldo e previsão de consumo',
  },
  {
    icon: 'document-text-outline',
    title: 'Orçamentos',
    description: 'Base tratada para análise de preços',
  },
];

const executionHistory = [
  {
    id: '#047',
    date: '19/08/2025',
    time: '08:00',
    duration: '12s',
    records: '142',
    status: 'Sucesso',
  },
  {
    id: '#046',
    date: '18/08/2025',
    time: '08:00',
    duration: '11s',
    records: '136',
    status: 'Sucesso',
  },
  {
    id: '#045',
    date: '17/08/2025',
    time: '08:00',
    duration: '13s',
    records: '128',
    status: 'Sucesso',
  },
  {
    id: '#044',
    date: '16/08/2025',
    time: '08:00',
    duration: '10s',
    records: '131',
    status: 'Sucesso',
  },
  {
    id: '#043',
    date: '15/08/2025',
    time: '08:00',
    duration: '18s',
    records: '119',
    status: 'Erro',
  },
  {
    id: '#042',
    date: '14/08/2025',
    time: '08:00',
    duration: '12s',
    records: '124',
    status: 'Sucesso',
  },
];

function PipelineStep({
  number,
  title,
  subtitle,
  color,
  items,
  type,
  isLast = false,
}) {
  return (
    <View>
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumber, { borderColor: color }]}>
          <Text style={[styles.stepNumberText, { color }]}>{number}</Text>
        </View>

        <View style={styles.stepHeaderText}>
          <Text style={styles.stepTitle}>{title}</Text>
          <Text style={styles.stepSubtitle}>{subtitle}</Text>
        </View>

        <View style={[styles.stepStatus, { backgroundColor: `${color}18` }]}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.stepStatusText, { color }]}>Concluído</Text>
        </View>
      </View>

      <View style={[styles.pipelineCard, { borderColor: `${color}40` }]}>
        {items.map((item, index) => (
          <View key={`${title}-${index}`}>
            <View style={styles.pipelineRow}>
              <View
                style={[
                  styles.pipelineIcon,
                  { backgroundColor: `${color}16` },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={19}
                  color={color}
                />
              </View>

              <View style={styles.pipelineInfo}>
                <Text style={styles.pipelineItemTitle}>{item.title}</Text>
                <Text style={styles.pipelineItemDescription}>
                  {item.description}
                </Text>
              </View>

              {type === 'extract' && (
                <Text style={styles.pipelineValue}>{item.value}</Text>
              )}

              {type === 'transform' && (
                <View style={styles.itemSuccess}>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={colors.success}
                  />
                  <Text style={styles.itemSuccessText}>
                    {item.status}
                  </Text>
                </View>
              )}

              {type === 'load' && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.success}
                />
              )}
            </View>

            {index < items.length - 1 && (
              <View style={styles.rowDivider} />
            )}
          </View>
        ))}
      </View>

      {!isLast && (
        <View style={styles.connector}>
          <View style={[styles.connectorLine, { backgroundColor: color }]} />
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textMuted}
          />
        </View>
      )}
    </View>
  );
}

export default function PipelineETLScreen() {
  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Sincronização de dados</Text>
            <Text style={styles.pageSubtitle}>
              Processamento e transformação dos dados do estúdio
            </Text>
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Operacional</Text>
          </View>
        </View>

        <View style={styles.lastExecutionCard}>
          <View style={styles.lastExecutionIcon}>
            <Ionicons
              name="server-outline"
              size={21}
              color={colors.success}
            />
          </View>

          <View style={styles.lastExecutionInfo}>
            <Text style={styles.lastExecutionLabel}>
              ÚLTIMA EXECUÇÃO
            </Text>
            <Text style={styles.lastExecutionValue}>
              Hoje, 08:00
            </Text>
            <Text style={styles.lastExecutionSubtitle}>
              142 registros processados em 12 segundos
            </Text>
          </View>

          <View style={styles.successBadge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.success}
            />
            <Text style={styles.successBadgeText}>Sucesso</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FLUXO DO PIPELINE</Text>

          <View style={styles.scheduleBadge}>
            <Ionicons
              name="time-outline"
              size={13}
              color={colors.textMuted}
            />
            <Text style={styles.scheduleText}>
              Execução diária · 08:00
            </Text>
          </View>
        </View>

        <PipelineStep
          number="1"
          title="Extract"
          subtitle="Coleta das fontes de dados"
          color="#23C7D9"
          items={extractItems}
          type="extract"
        />

        <PipelineStep
          number="2"
          title="Transform"
          subtitle="Limpeza, normalização e inteligência"
          color="#D04A4D"
          items={transformItems}
          type="transform"
        />

        <PipelineStep
          number="3"
          title="Load"
          subtitle="Disponibilização dos dados tratados"
          color={colors.success}
          items={loadItems}
          type="load"
          isLast
        />

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.historyTitle}>
                Histórico de execuções
              </Text>
              <Text style={styles.historySubtitle}>
                Últimos processamentos realizados
              </Text>
            </View>

            <View style={styles.historyCountBadge}>
              <Text style={styles.historyCountText}>
                Últimas 6
              </Text>
            </View>
          </View>

          <View style={styles.historyCard}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.colId]}>
                    ID
                  </Text>

                  <Text style={[styles.tableHeaderText, styles.colDate]}>
                    DATA
                  </Text>

                  <Text style={[styles.tableHeaderText, styles.colTime]}>
                    HORA
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderText,
                      styles.colDuration,
                    ]}
                  >
                    DURAÇÃO
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderText,
                      styles.colRecords,
                    ]}
                  >
                    REGISTROS
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderText,
                      styles.colStatus,
                    ]}
                  >
                    STATUS
                  </Text>
                </View>

                {executionHistory.map((item, index) => {
                  const success = item.status === 'Sucesso';

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.tableRow,
                        index < executionHistory.length - 1 &&
                          styles.tableRowBorder,
                      ]}
                    >
                      <Text style={[styles.tableId, styles.colId]}>
                        {item.id}
                      </Text>

                      <Text style={[styles.tableText, styles.colDate]}>
                        {item.date}
                      </Text>

                      <Text style={[styles.tableText, styles.colTime]}>
                        {item.time}
                      </Text>

                      <Text
                        style={[
                          styles.tableText,
                          styles.colDuration,
                        ]}
                      >
                        {item.duration}
                      </Text>

                      <Text
                        style={[
                          styles.tableText,
                          styles.colRecords,
                        ]}
                      >
                        {item.records}
                      </Text>

                      <View style={styles.colStatus}>
                        <View
                          style={[
                            styles.executionStatus,
                            success
                              ? styles.executionSuccess
                              : styles.executionError,
                          ]}
                        >
                          <Ionicons
                            name={
                              success
                                ? 'checkmark-circle'
                                : 'close-circle'
                            }
                            size={13}
                            color={
                              success
                                ? colors.success
                                : '#FF5368'
                            }
                          />

                          <Text
                            style={[
                              styles.executionStatusText,
                              {
                                color: success
                                  ? colors.success
                                  : '#FF5368',
                              },
                            ]}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}