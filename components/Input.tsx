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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    minHeight: 48,
  },
  focusedInputContainer: {
    borderColor: theme.colors.primary,
  },
  errorInputContainer: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
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
