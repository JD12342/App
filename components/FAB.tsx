import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Platform,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    ViewStyle
} from 'react-native';
import theme from '../lib/theme';

interface FABProps {
  onPress: () => void;
  icon?: string | React.ReactNode;
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  iconColor?: string;
}

/**
 * An enhanced Floating Action Button component with modern styling
 */
const FAB: React.FC<FABProps> = ({
  onPress,
  icon = "add",
  style,
  size = 'medium',
  color = theme.colors.primary,
  iconColor = '#fff'
}) => {
  const fabSize = 
    size === 'small' ? 44 : 
    size === 'large' ? 68 : 60;

  const iconSize = 
    size === 'small' ? 20 : 
    size === 'large' ? 32 : 28;

  const fabStyle = {
    width: fabSize,
    height: fabSize,
    backgroundColor: color,
    borderRadius: fabSize / 2,
  };

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return (
        <MaterialIcons 
          name={icon as any} 
          size={iconSize} 
          color={iconColor} 
        />
      );
    }
    return icon;
  };

  return (
    <TouchableOpacity
      style={[styles.fab, fabStyle, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {renderIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default FAB;
