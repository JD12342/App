import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/Button';
import FormSection from '../../../components/FormSection';
import Header from '../../../components/Header';
import Input from '../../../components/Input';
import { gardenService } from '../../../lib/dataService';
import theme from '../../../lib/theme';

export default function EditGardenScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load the garden data
  useEffect(() => {
    if (id) {
      const loadGarden = async () => {
        try {
          const garden = await gardenService.getGarden(id);
          if (garden) {
            setName(garden.name);
            setLocation(garden.location || '');
            setDescription(garden.description || '');
          }
        } catch (error) {
          console.error('Error loading garden:', error);
        } finally {
          setInitialLoading(false);
        }
      };
      
      loadGarden();
    }
  }, [id]);

  const validate = () => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Garden name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async () => {
    if (!validate() || !id) return;
    
    setIsLoading(true);
    try {
      await gardenService.updateGarden(id, {
        name: name.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      
      // Navigate back immediately
      router.back();
    } catch (error) {
      console.error('Error updating garden:', error);
      Alert.alert('Error', 'Failed to update garden. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Edit Garden"
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
            title="Save Changes"
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
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  buttonContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
});
