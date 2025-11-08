import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import FormSection from '../../components/FormSection';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Typography from '../../components/Typography';
import { gardenService, harvestService } from '../../lib/dataService';
import theme from '../../lib/theme';
import { Unit } from '../../types/types';

// Units for the dropdown
const UNITS: Unit[] = ['kg', 'g', 'lb', 'oz', 'count', 'bunch'];

export default function NewHarvestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ gardenId: string }>();

  const [plantName, setPlantName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<Unit>('count');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gardenName, setGardenName] = useState('');
  
  const [errors, setErrors] = useState<{
    plantName?: string;
    quantity?: string;
  }>({});
  
  const [isLoading, setIsLoading] = useState(false);

  // Load garden name
  useEffect(() => {
    if (params.gardenId) {
      const loadGarden = async () => {
        try {
          const garden = await gardenService.getGarden(params.gardenId);
          if (garden) {
            setGardenName(garden.name);
          }
        } catch (error) {
          console.error('Error loading garden:', error);
        }
      };
      
      loadGarden();
    }
  }, [params.gardenId]);

  const validate = () => {
    const newErrors: { plantName?: string; quantity?: string } = {};
    
    if (!plantName.trim()) {
      newErrors.plantName = 'Plant name is required';
    }
    
    if (!quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !params.gardenId) return;
    
    setIsLoading(true);
    try {
      const harvest = await harvestService.createHarvest({
        gardenId: params.gardenId,
        plantName: plantName.trim(),
        quantity: Number(quantity),
        unit,
        date: date.getTime(),
        notes: notes.trim() || undefined
      });
      
      if (!harvest) {
        throw new Error('Failed to create harvest');
      }
      
      // Navigate back immediately (user sees success)
      router.back();
    } catch (error) {
      console.error('Error saving harvest:', error);
      Alert.alert('Error', 'Failed to save harvest. Please try again.');
      setIsLoading(false);
    }
    // Note: we don't set isLoading to false here because we've already navigated back
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleUnitSelect = (selectedUnit: Unit) => {
    setUnit(selectedUnit);
    setShowUnitPicker(false);
  };

  const closeUnitPicker = () => setShowUnitPicker(false);
  const closeDatePicker = () => setShowDatePicker(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
      if (Platform.OS !== 'ios') {
        setShowDatePicker(false);
      }
    }

    if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Add Harvest"
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
          {gardenName ? (
            <Typography
              variant="body1"
              color={theme.colors.textSecondary}
              style={styles.gardenName}
            >
              Garden: {gardenName}
            </Typography>
          ) : null}
          
          <FormSection title="Harvest Details">
            <Input
              label="Plant Name"
              value={plantName}
              onChangeText={setPlantName}
              placeholder="E.g., Tomato, Basil"
              autoCapitalize="words"
              error={errors.plantName}
            />

            <View style={styles.row}>
              <View style={styles.quantityInput}>
                <Input
                  label="Quantity"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  error={errors.quantity}
                />
              </View>

              <View style={styles.unitInput}>
                <Typography variant="body2" style={styles.label}>
                  Unit
                </Typography>
                <TouchableOpacity
                  style={styles.unitPicker}
                  onPress={() => setShowUnitPicker(true)}
                >
                  <Typography variant="body1">{unit}</Typography>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Typography variant="body2" style={styles.label}>
              Harvest Date
            </Typography>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowDatePicker(true)}
            >
              <Typography variant="body1">{formatDate(date)}</Typography>
              <MaterialIcons
                name="calendar-today"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <Input
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional details"
              multiline
              numberOfLines={4}
              style={styles.notesInput}
            />
          </FormSection>


        </ScrollView>

        <Modal
          visible={showUnitPicker}
          transparent
          animationType="fade"
          onRequestClose={closeUnitPicker}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={closeUnitPicker}>
              <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Typography variant="h4" style={styles.modalTitle}>
                Select Unit
              </Typography>
              {UNITS.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleUnitSelect(option)}
                  style={styles.modalOption}
                >
                  <Typography variant="body1" style={styles.modalOptionText}>
                    {option}
                  </Typography>
                </TouchableOpacity>
              ))}
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={closeUnitPicker} style={styles.modalButton}>
                  <Typography
                    variant="body2"
                    style={[styles.modalButtonText, styles.modalCancelText]}
                  >
                    Cancel
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={closeDatePicker}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={closeDatePicker}>
              <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Typography variant="h4" style={styles.modalTitle}>
                Select Date
              </Typography>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
              {Platform.OS === 'ios' && (
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={closeDatePicker} style={styles.modalButton}>
                    <Typography variant="body2" style={styles.modalButtonText}>
                      Done
                    </Typography>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Save Harvest"
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
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  gardenName: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityInput: {
    flex: 2,
    marginRight: theme.spacing.md,
  },
  unitInput: {
    flex: 1,
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  unitPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  buttonContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    zIndex: 1,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalOption: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  modalOptionText: {
    color: theme.colors.text,
  },
  modalActions: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  modalButtonText: {
    color: theme.colors.primary,
  },
  modalCancelText: {
    color: theme.colors.error,
  },
});
