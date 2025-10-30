import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Typography from '../../components/Typography';
import { useAuth } from '../../contexts/AuthContext';
import { getFirebaseErrorMessage } from '../../lib/firebaseUtils';
import theme from '../../lib/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, enterAsGuest } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (isCreatingAccount) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Use our improved error handling
      const friendlyMessage = getFirebaseErrorMessage(error);
      
      // Set field-specific errors or show general alert
      if (friendlyMessage.toLowerCase().includes('email')) {
        setErrors({ email: friendlyMessage });
      } else if (friendlyMessage.toLowerCase().includes('password')) {
        setErrors({ password: friendlyMessage });
      } else {
        alert(friendlyMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    setIsLoading(true);
    try {
      await enterAsGuest();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Guest entry error:', error);
      alert('Unable to enter as guest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsCreatingAccount(!isCreatingAccount);
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
          <Typography variant="h1" style={styles.title}>
            Garden Tracker
          </Typography>
          <Typography variant="body2" color={theme.colors.textSecondary} style={styles.subtitle}>
            {"Track your garden's growth and harvest"}
          </Typography>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
            leftIcon={
              <MaterialIcons
                name="email"
                size={24}
                color={theme.colors.textSecondary}
              />
            }
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            leftIcon={
              <MaterialIcons
                name="lock"
                size={24}
                color={theme.colors.textSecondary}
              />
            }
          />

          <Button
            title={isCreatingAccount ? 'Create Account' : 'Sign In'}
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            size="large"
            style={styles.submitButton}
          />

          <Button
            title={
              isCreatingAccount
                ? 'Already have an account? Sign In'
                : 'Need an account? Create one'
            }
            onPress={toggleAuthMode}
            variant="text"
            fullWidth
            style={styles.toggleButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Typography variant="body2" color={theme.colors.textSecondary} style={styles.dividerText}>
              or
            </Typography>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="🌱 Continue as Guest"
            onPress={handleGuestEntry}
            variant="outline"
            fullWidth
            loading={isLoading}
            style={styles.demoButton}
          />

          <Typography variant="caption" color={theme.colors.textSecondary} style={styles.guestWarning}>
            Guest mode: Your data will be stored locally and will be lost if you delete the app
          </Typography>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.primary,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  toggleButton: {
    marginTop: theme.spacing.md,
  },
  demoButton: {
    marginTop: theme.spacing.sm,
  },
  guestWarning: {
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.sm,
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
});
