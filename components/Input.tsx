import React, { useState } from 'react';
import {
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import theme from '../lib/theme';
import Typography from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * A reusable input component with label and error message
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(null as any);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(null as any);
    }
  };

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.focusedInputContainer,
    error && styles.errorInputContainer,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Typography variant="body2" style={styles.label}>{label}</Typography>}
      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && (
        <Typography variant="caption" color={theme.colors.error} style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
    paddingLeft: theme.spacing.xs,
    fontWeight: '600',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    minHeight: 52,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  focusedInputContainer: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorInputContainer: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    paddingLeft: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  rightIcon: {
    paddingRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  errorText: {
    marginTop: theme.spacing.xs,
  },
});

export default Input;
