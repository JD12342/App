import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View, type DimensionValue } from 'react-native';
import theme from '../lib/theme';
import Button from './Button';
import Typography from './Typography';

export interface FeatureWalkthroughStep {
  title: string;
  description: string;
  icon: string;
}

interface FeatureWalkthroughProps {
  visible: boolean;
  steps: FeatureWalkthroughStep[];
  onClose: () => void;
  onComplete?: () => void;
}

/**
 * Displays an overlay walkthrough explaining the primary features of a screen.
 */
const FeatureWalkthrough: React.FC<FeatureWalkthroughProps> = ({
  visible,
  steps,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  const progressPercent = useMemo<DimensionValue>(() => {
    if (!totalSteps) {
      return '0%';
    }
    const percentage = ((currentStep + 1) / totalSteps) * 100;
    return `${percentage}%`;
  }, [currentStep, totalSteps]);

  const handleBack = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const completeTour = () => {
    onComplete?.();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    completeTour();
  };

  const handleSkip = () => {
    completeTour();
  };

  const step = steps[currentStep];

  return (
    <Modal
      transparent
      visible={visible && !!totalSteps}
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
  <View style={styles.scrim} />
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={step?.icon as any}
              size={36}
              color={theme.colors.primary}
            />
          </View>
          <Typography variant="h2" style={styles.title}>
            {step?.title}
          </Typography>
          <Typography variant="body1" color={theme.colors.textSecondary} style={styles.description}>
            {step?.description}
          </Typography>

          <View style={styles.progressContainer}>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              Step {currentStep + 1} of {totalSteps}
            </Typography>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressPercent }]} />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonColumn}>
              {currentStep > 0 ? (
                <Button
                  title="Back"
                  variant="outline"
                  onPress={handleBack}
                  fullWidth
                />
              ) : (
                <TouchableOpacity onPress={handleSkip}>
                  <Typography variant="button" color={theme.colors.primary}>
                    Skip
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.buttonColumn}>
              <Button
                title={currentStep === totalSteps - 1 ? 'Got it' : 'Next'}
                onPress={handleNext}
                fullWidth
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  card: {
    width: Math.min(width - theme.spacing.xxl, 420),
    height: 420, // Fixed height for consistency
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure even spacing
    ...theme.shadows.large,
    zIndex: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    height: 32, // Fixed height for title
    marginBottom: theme.spacing.sm,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    height: 88, // Fixed height for description (4 lines)
    marginBottom: theme.spacing.lg,
  },
  progressContainer: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  buttonColumn: {
    flex: 1,
    alignItems: 'stretch',
  },
});

export default FeatureWalkthrough;
