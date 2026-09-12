import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { label: 'Dashboard', icon: 'grid-outline', route: 'Dashboard' },
  { label: 'Orçamentos', icon: 'calendar-outline', route: 'Orcamentos' },
  { label: 'Flash Tattoos', icon: 'flash-outline', route: 'FlashTattoos' },
  { label: 'Estoque', icon: 'cube-outline', route: 'Estoque' },
  { label: 'Histórico de clientes', icon: 'people-outline', route: 'Historico' },
];

export default function CustomDrawerContent(props) {
  const { state, navigation } = props;
  const activeRouteName = state.routeNames[state.index];
  const { nome, fotoPerfil, sair } = useAuth();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.iconBox}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logoText}>ORCANA</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuList}>
          {menuItems.map((item) => {
            const isActive = activeRouteName === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => navigation.navigate(item.route)}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={isActive ? colors.text : colors.textMuted}
                />
                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('SincronizacaoDados')}
        >
          <Ionicons name="server-outline" size={18} color={colors.textMuted} />
          <Text style={styles.menuLabel}>Sincronização de Dados</Text>
          <View style={styles.dot} />
        </TouchableOpacity>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.userRow}
          onPress={() => {
            navigation.closeDrawer();
            navigation.getParent()?.navigate('PerfilUsuario');
          }}
          accessibilityRole="button"
          accessibilityLabel="Abrir meu perfil"
        >
          {fotoPerfil ? (
            <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nome.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{nome}</Text>
            <Text style={styles.userRole}>Equipe do estúdio</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutRow}
          onPress={() => {
            sair();
            navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
          <Text style={styles.menuLabel}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: {
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: { width: 18, height: 18 },
  logoText: { color: colors.text, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  menuList: { paddingHorizontal: 12, paddingTop: 12, gap: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  menuItemActive: { backgroundColor: colors.primary },
  menuLabel: { color: colors.textMuted, fontSize: 15, fontWeight: '500' },
  menuLabelActive: { color: colors.text, fontWeight: '700' },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 16,
    marginHorizontal: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginLeft: 'auto',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    padding: 16,
    gap: 16,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: colors.text, fontWeight: '700' },
  userName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  userRole: { color: colors.textMuted, fontSize: 13 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
