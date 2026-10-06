import React, { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../tokens/colors';
import { layout, radius, spacing, typography } from '../tokens/layout';
import { Text } from './Text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  /** Rendered inside the field, before the input (e.g. a country code or icon). */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, hint, error, leading, trailing, style, onFocus, onBlur, editable = true, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" tone="secondary" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.field,
          { borderColor, borderWidth: focused || error ? 2 : 1 },
          !editable && styles.disabled,
        ]}
      >
        {leading}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailing}
      </View>
      {(error || hint) && (
        <Text variant="caption" tone={error ? 'danger' : 'muted'} style={styles.helper}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'stretch' },
  label: { marginBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchLg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  disabled: { backgroundColor: colors.surfaceSunken },
  helper: { marginTop: spacing.xs },
});
