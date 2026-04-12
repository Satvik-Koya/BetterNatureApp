import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Colors, Type, Radius, Shadows } from '../../config/theme';
import BrushText from '../../components/ui/BrushText';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import { openDonationForm } from '../../services/zeffy';
import { payWithApplePay, payWithCard, isApplePayAvailable } from '../../services/payments';
import { recordDonation } from '../../services/database';
import useAuthStore from '../../store/authStore';

const AMOUNTS = [5, 15, 25, 50];

export default function DonateScreen() {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [paying, setPaying] = useState(false);
  const user = useAuthStore((s) => s.user);

  function getAmount() {
    if (isCustom) {
      const n = Number(customAmount);
      return isNaN(n) || n <= 0 ? 0 : n;
    }
    return selectedAmount;
  }

  async function handlePay(method) {
    const amount = getAmount();
    if (!amount) {
      Alert.alert('Pick an amount', 'Enter a donation amount to continue.');
      return;
    }
    setPaying(true);
    try {
      const fn = method === 'apple' ? payWithApplePay : payWithCard;
      const result = await fn({
        amount,
        label: 'Better Nature Donation',
        recurring: isRecurring,
      });
      if (result.ok) {
        await recordDonation({
          user_id: user?.id,
          amount,
          recurring: isRecurring,
          method: method === 'apple' ? 'apple_pay' : 'card',
          status: 'succeeded',
          created_at: new Date().toISOString(),
        });
        Alert.alert('Thank you!', `Your $${amount}${isRecurring ? '/month' : ''} donation supports food rescue, conservation, and clean water programs.`);
      }
    } catch (e) {
      Alert.alert('Payment failed', e.message || 'Please try again');
    } finally {
      setPaying(false);
    }
  }

  function handleZeffyFallback() {
    openDonationForm({ amount: getAmount(), recurring: isRecurring });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BrushText variant="screenTitle" style={styles.title}>
        Make a Donation
      </BrushText>
      <Text style={styles.subtitle}>
        100% of your donation goes to Better Nature programs. Tax-deductible.
      </Text>

      {/* Amount Selection */}
      <View style={styles.amountsRow}>
        {AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            onPress={() => {
              setSelectedAmount(amt);
              setIsCustom(false);
            }}
            style={[
              styles.amountBtn,
              selectedAmount === amt && !isCustom && styles.amountSelected,
            ]}
          >
            <Text
              style={[
                styles.amountText,
                selectedAmount === amt && !isCustom && styles.amountTextSelected,
              ]}
            >
              ${amt}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setIsCustom(true)}
          style={[styles.amountBtn, isCustom && styles.amountSelected]}
        >
          <Text style={[styles.amountText, isCustom && styles.amountTextSelected]}>
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {isCustom && (
        <View style={styles.customInput}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            value={customAmount}
            onChangeText={setCustomAmount}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={Colors.grayMid}
            style={styles.customField}
          />
        </View>
      )}

      {/* Monthly Toggle */}
      <View style={styles.recurringRow}>
        <View>
          <Text style={styles.recurringLabel}>Monthly Donation</Text>
          <Text style={styles.recurringDesc}>
            Set up a recurring gift to sustain our mission
          </Text>
        </View>
        <Toggle value={isRecurring} onToggle={() => setIsRecurring(!isRecurring)} />
      </View>

      {/* Payment Methods */}
      <BrushText variant="sectionHeader" style={styles.sectionTitle}>
        Payment Methods
      </BrushText>

      {isApplePayAvailable && (
        <TouchableOpacity
          style={[styles.paymentOption, styles.applePayBtn]}
          onPress={() => handlePay('apple')}
          disabled={paying}
        >
          <Text style={styles.paymentEmoji}></Text>
          <Text style={styles.applePayText}>Pay</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.paymentOption}
        onPress={() => handlePay('card')}
        disabled={paying}
      >
        <Text style={styles.paymentEmoji}>💳</Text>
        <Text style={styles.paymentText}>Credit / Debit Card</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.paymentOption}
        onPress={handleZeffyFallback}
        disabled={paying}
      >
        <Text style={styles.paymentEmoji}>🌐</Text>
        <Text style={styles.paymentText}>Donate via Zeffy (web)</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Button
        title={
          paying
            ? 'Processing…'
            : `Donate $${getAmount() || (isCustom ? '...' : selectedAmount)}${isRecurring ? '/month' : ''}`
        }
        onPress={() => handlePay(isApplePayAvailable ? 'apple' : 'card')}
        loading={paying}
        style={styles.donateBtn}
      />

      <Text style={styles.powered}>
        Secured by Apple Pay · Tax-deductible receipt sent to your email
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  title: { color: Colors.green },
  subtitle: { ...Type.body, color: Colors.gray, marginTop: 4, marginBottom: 24 },
  amountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  amountBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.grayLight,
    ...Shadows.card,
  },
  amountSelected: {
    borderColor: Colors.pink,
    backgroundColor: Colors.pinkLight,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
  },
  amountTextSelected: {
    color: Colors.pink,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.pink,
  },
  dollar: { fontSize: 20, fontWeight: '700', color: Colors.dark, marginRight: 8 },
  customHint: { ...Type.caption },
  customField: { flex: 1, fontSize: 18, fontWeight: '600', color: Colors.dark, paddingVertical: 0 },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 24,
    ...Shadows.card,
  },
  recurringLabel: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  recurringDesc: { ...Type.caption, marginTop: 2 },
  sectionTitle: { color: Colors.green, marginBottom: 12 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 10,
    ...Shadows.card,
  },
  paymentEmoji: { fontSize: 24, marginRight: 14 },
  paymentText: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.dark },
  arrow: { fontSize: 24, color: Colors.grayMid },
  applePayBtn: {
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  applePayText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  donateBtn: { marginTop: 24 },
  powered: { ...Type.caption, textAlign: 'center', marginTop: 16 },
});
