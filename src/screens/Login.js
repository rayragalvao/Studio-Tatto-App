import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';
import { styles } from './Login.styles';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Svg style={styles.glow} width="500" height="500">
                <Defs>
                    <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#D70004" stopOpacity="0.35" />
                        <Stop offset="60%" stopColor="#D70004" stopOpacity="0.12" />
                        <Stop offset="100%" stopColor="#D70004" stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                <Rect width="500" height="500" fill="url(#glow)" />
            </Svg>

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
                <Text style={styles.subtitle}>Gestão inteligente para estúdio de tatuagem</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>E-MAIL</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ana@orcana.studio"
                    placeholderTextColor={colors.textPlaceholder}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={[styles.label, { marginTop: 20 }]}>SENHA</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textPlaceholder}
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                />

                <TouchableOpacity activeOpacity={0.85} style={{ marginTop: 24 }}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Entrar no estúdio</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.footerText}>Acesso restrito à equipe autorizada</Text>
            </View>
        </KeyboardAvoidingView>
    );
}