import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, Trash2 } from 'lucide-react-native';
import { apiErrorMessage, type Data } from '@a2b/api-client';
import { Button, Card, ScreenHeader, ScreenScroll, spacing, Text, TextField } from '@a2b/ui';
import { useAppSession } from '../session/session_context.tsx';
import type { UploadFile } from '../session/create_app_session.ts';
import { Avatar } from '../media/avatar.tsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EditAccountScreenProps {
  onDone: () => void;
  /**
   * Lets the person choose a profile photo (camera or library). Leave it out
   * in apps without an image picker; the photo section is then hidden.
   */
  pickPhoto?: () => Promise<UploadFile | null>;
}

/** Name, email and profile photo of the signed-in user. */
export function EditAccountScreen({ onDone, pickPhoto }: EditAccountScreenProps) {
  const { api, upload, useSession } = useAppSession();
  const user = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState<'upload' | 'remove' | null>(null);

  const emailError = email.trim() && !EMAIL.test(email.trim()) ? 'Enter a valid email address' : '';

  const save = async () => {
    setError('');
    setIsSaving(true);
    try {
      const { data } = await api.me.update({
        body: { fullName: fullName.trim(), ...(email.trim() ? { email: email.trim() } : {}) },
      });
      setUser(data);
      onDone();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const changePhoto = async () => {
    const file = await pickPhoto?.();
    if (!file) return;
    setError('');
    setPhotoBusy('upload');
    try {
      const { data } = await upload<{ data: Data.User }>('me/avatar', {}, file);
      setUser(data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setPhotoBusy(null);
    }
  };

  const removePhoto = async () => {
    setError('');
    setPhotoBusy('remove');
    try {
      const { data } = await api.avatars.destroy({});
      setUser(data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setPhotoBusy(null);
    }
  };

  return (
    <>
      <ScreenHeader title="Edit profile" onBackPress={onDone} />
      <ScreenScroll edges={['bottom']}>
        {pickPhoto && (
          <View style={styles.photo}>
            <Avatar path={user?.avatarPath} name={fullName || user?.fullName} size={96} />
            <View style={styles.photoActions}>
              <Button
                title={user?.avatarPath ? 'Change photo' : 'Add photo'}
                icon={Camera}
                variant="secondary"
                size="md"
                onPress={changePhoto}
                loading={photoBusy === 'upload'}
                disabled={!!photoBusy}
              />
              {user?.avatarPath ? (
                <Button
                  title="Remove"
                  icon={Trash2}
                  variant="ghost"
                  size="md"
                  onPress={removePhoto}
                  loading={photoBusy === 'remove'}
                  disabled={!!photoBusy}
                />
              ) : null}
            </View>
          </View>
        )}

        <Card style={styles.form}>
          <TextField
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            autoComplete="name"
            textContentType="name"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            error={emailError || undefined}
            hint="Optional. For receipts and account notices."
          />
          <TextField label="Mobile" value={user?.phone ?? ''} editable={false} hint="Your sign-in number can't be changed." />
        </Card>

        {error ? <Text tone="danger">{error}</Text> : null}

        <Button
          title="Save changes"
          onPress={save}
          loading={isSaving}
          disabled={fullName.trim().length < 2 || !!emailError || !!photoBusy}
        />
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  photo: { alignItems: 'center', gap: spacing.md },
  photoActions: { flexDirection: 'row', gap: spacing.sm },
  form: { gap: spacing.xl },
});
