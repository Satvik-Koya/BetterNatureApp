import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Type } from '../../config/theme';
import BrushText from '../../components/ui/BrushText';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import ResponsiveContainer from '../../components/ui/ResponsiveContainer';

export default function WelcomeScreen({ navigation }) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ResponsiveContainer maxWidth={520}>
        <View style={styles.top}>
          <Logo size={160} style={styles.logo} />
          <BrushText variant="heroStat" style={styles.title}>
            Better Nature
          </BrushText>
          <Text style={styles.tagline}>Food rescue · Conservation · Clean water</Text>
        </View>

        <View style={styles.bottom}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('SignupStep1')}
          />
          <Button
            title="I already have an account"
            variant="secondary"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginBtn}
          />

          <Text style={styles.footnote}>
            Restaurant partners, chapter presidents, and executives sign in with the
            credentials sent to them after approval.
          </Text>
        </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { flexGrow: 1, paddingBottom: 60, paddingHorizontal: 24 },
  top: {
    paddingTop: 80,
    paddingBottom: 50,
    alignItems: 'center',
  },
  logo: { marginBottom: 20 },
  title: { color: Colors.green },
  tagline: { ...Type.caption, marginTop: 8, color: Colors.green },
  bottom: {},
  loginBtn: { marginTop: 12 },
  footnote: {
    ...Type.caption,
    textAlign: 'center',
    marginTop: 28,
    fontStyle: 'italic',
    color: Colors.gray,
  },
});
