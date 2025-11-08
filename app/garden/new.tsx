import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import FormSection from '../../components/FormSection';
import Header from '../../components/Header';
import Input from '../../components/Input';
import { gardenService } from '../../lib/dataService';
import theme from '../../lib/theme';

export default function GardenFormScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isLoading, setIsLoading] = useState(false);



  const validate = () => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Garden name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const garden = await gardenService.createGarden({
        name: name.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      
      if (!garden) {
        throw new Error('Failed to create garden');
      }
      
      // Navigate back immediately (user sees success)
      router.back();
    } catch (error) {
      console.error('Error saving garden:', error);
      Alert.alert('Error', 'Failed to save garden. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Add Garden"
        showBackButton
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <FormSection title="Garden Details">
            <Input
              label="Garden Name"
              value={name}
              onChangeText={setName}
              placeholder="E.g., Backyard Garden"
              autoCapitalize="words"
              error={errors.name}
              leftIcon={<MaterialIcons name="eco" size={24} color={theme.colors.textSecondary} />}
            />

            <Input
              label="Location (Optional)"
              value={location}
              onChangeText={setLocation}
              placeholder="E.g., Backyard, North side"
              autoCapitalize="words"
              leftIcon={<MaterialIcons name="place" size={24} color={theme.colors.textSecondary} />}
            />

            <Input
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us about your garden..."
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
            />
          </FormSection>


        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Create Garden"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            size="large"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
  },
  buttonContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
});
