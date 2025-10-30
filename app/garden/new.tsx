import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import FormSection from '../../components/FormSection';
import Header from '../../components/Header';
import Input from '../../components/Input';
import { gardenService } from '../../lib/dataService';
import theme from '../../lib/theme';

export default function GardenFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const isEditing = !!params.id;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // If editing, load the garden data
  useEffect(() => {
    if (isEditing) {
      const loadGarden = async () => {
        try {
          const garden = await gardenService.getGarden(params.id);
          if (garden) {
            setName(garden.name);
            setLocation(garden.location || '');
          }
        } catch (error) {
          console.error('Error loading garden:', error);
        } finally {
          setInitialLoading(false);
        }
      };
      
      loadGarden();
    }
  }, [isEditing, params.id]);

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
      if (isEditing) {
        await gardenService.updateGarden(params.id, {
          name: name.trim(),
          location: location.trim() || undefined,
        });
      } else {
        await gardenService.createGarden({
          name: name.trim(),
          location: location.trim() || undefined,
        });
      }
      router.back();
    } catch (error) {
      console.error('Error saving garden:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={isEditing ? 'Edit Garden' : 'Add Garden'}
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
          <FormSection>
            <Input
              label="Garden Name"
              value={name}
              onChangeText={setName}
              placeholder="E.g., Backyard Garden"
              autoCapitalize="words"
              error={errors.name}
            />

            <Input
              label="Location (Optional)"
              value={location}
              onChangeText={setLocation}
              placeholder="E.g., Backyard, North side"
              autoCapitalize="words"
            />
          </FormSection>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Save Garden"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={initialLoading}
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
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  buttonContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
});
