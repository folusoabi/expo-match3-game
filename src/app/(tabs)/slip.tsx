import React, { useMemo, useState } from "react";
import { View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text, MonoText } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PillToggle } from "@/components/ui/PillToggle";
import { EmptyState } from "@/components/ui/States";
import { SlipSelectionCard } from "@/components/betting";
import { colors } from "@/constants/theme";
import { formatCurrency, formatOdds } from "@/utils/format";
import { useApp } from "@/state/AppProvider";

export default function BetSlipScreen() {
  const { slip, removeSlipSelection, clearSlip, balance, placeAccumulator, placeSingles } = useApp();
  const [mode, setMode] = useState<"accumulator" | "singles">("accumulator");
  const [stake, setStake] = useState("100");
  const [singleStakes, setSingleStakes] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<{ stake: number; potentialReturn: number; newBalance: number } | null>(null);

  const combinedOdds = useMemo(() => slip.reduce((acc, s) => acc * s.odds, 1), [slip]);
  const stakeNum = parseFloat(stake) || 0;
  const potentialReturn = Math.round(stakeNum * combinedOdds * 100) / 100;

  const singlesTotal = useMemo(
    () => slip.reduce((sum, s) => sum + (parseFloat(singleStakes[s.id]) || 0), 0),
    [slip, singleStakes]
  );

  function handlePlace() {
    if (slip.length > 1 && mode === "singles") {
      const stakesMap: Record<string, number> = {};
      let total = 0;
      for (const s of slip) {
        const v = parseFloat(singleStakes[s.id]) || 0;
        stakesMap[s.id] = v;
        total += v;
      }
      if (total === 0 || total > balance) return;
      placeSingles(stakesMap);
      setConfirmation({ stake: total, potentialReturn: slip.reduce((sum, s) => sum + (stakesMap[s.id] || 0) * s.odds, 0), newBalance: balance - total });
    } else {
      if (stakeNum <= 0 || stakeNum > balance) return;
      placeAccumulator(stakeNum);
      setConfirmation({ stake: stakeNum, potentialReturn, newBalance: balance - stakeNum });
    }
  }

  if (confirmation) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-profit items-center justify-center mb-5">
            <Ionicons name="checkmark" size={30} color="#fff" />
          </View>
          <Text className="font-sans-bold text-[19px] text-text-primary text-center">Prediction placed</Text>
          <Text className="text-text-secondary text-[13.5px] text-center mt-2 leading-5">
            Your simulated stake of {formatCurrency(confirmation.stake)} is locked in. Reveal the result from the match
            or your history whenever you're ready.
          </Text>
          <Card className="w-full p-4 mt-6">
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-text-secondary text-[13px]">Potential return</Text>
              <MonoText className="text-text-primary text-[14px] font-mono-medium">{formatCurrency(confirmation.potentialReturn)}</MonoText>
            </View>
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-text-secondary text-[13px]">New balance</Text>
              <MonoText className="text-text-primary text-[14px] font-mono-medium">{formatCurrency(confirmation.newBalance)}</MonoText>
            </View>
          </Card>
          <View className="w-full gap-3 mt-6">
            <Button label="View in History" fullWidth onPress={() => { setConfirmation(null); router.push("/(tabs)/history"); }} />
            <Button label="Continue Simulation" variant="secondary" fullWidth onPress={() => { setConfirmation(null); router.push("/(tabs)/"); }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <Text className="font-sans-bold text-[22px] text-text-primary">Bet Slip</Text>
        {slip.length > 0 ? (
          <Pressable onPress={clearSlip}>
            <Text className="text-loss text-[13px] font-sans-medium">Clear all</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="px-5 mb-3">
        <View className="flex-row items-center gap-2 bg-edge/8 border border-edge/20 rounded-xl px-3.5 py-2.5">
          <Ionicons name="information-circle" size={16} color={colors.edge} />
          <Text className="text-edge text-[12px] font-sans-medium flex-1">SIMULATION · Virtual USD · No real money</Text>
        </View>
      </View>

      {slip.length === 0 ? (
        <ScrollView>
          <Card className="mx-5">
            <EmptyState
              icon="receipt-outline"
              title="Your bet slip is empty"
              message="Open a match and tap a market to add a prediction here."
              actionLabel="Browse Sports"
              onAction={() => router.push("/(tabs)/sports")}
            />
          </Card>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            {slip.map((s) => (
              <SlipSelectionCard key={s.id} selection={s} onRemove={() => removeSlipSelection(s.id)} />
            ))}

            {slip.length > 1 ? (
              <View className="my-3">
                <PillToggle
                  options={[
                    { label: "ACCUMULATOR", value: "accumulator" },
                    { label: "SINGLES", value: "singles" },
                  ]}
                  value={mode}
                  onChange={(v) => setMode(v as "accumulator" | "singles")}
                />
              </View>
            ) : null}

            {mode === "accumulator" || slip.length === 1 ? (
              <Card className="p-4 mt-2">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-text-secondary text-[13px]">
                    {slip.length > 1 ? `Combined odds (${slip.length}-fold)` : "Odds"}
                  </Text>
                  <MonoText className="text-text-primary text-[16px] font-mono-bold">{formatOdds(combinedOdds)}</MonoText>
                </View>
                <View className="flex-row items-center justify-between bg-surfaceInset rounded-xl px-4 py-3 mb-3">
                  <Text className="text-text-secondary text-[13px] font-sans-medium">Virtual stake</Text>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-text-primary text-[14px] font-sans-semibold">$</Text>
                    <TextInput
                      value={stake}
                      onChangeText={setStake}
                      keyboardType="decimal-pad"
                      className="text-text-primary font-mono-medium text-[15px] text-right min-w-[70px]"
                    />
                  </View>
                </View>
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-text-secondary text-[13px]">Potential return</Text>
                  <MonoText className="text-profit text-[15px] font-mono-bold">{formatCurrency(potentialReturn)}</MonoText>
                </View>
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-text-secondary text-[13px]">Balance after</Text>
                  <MonoText className="text-text-primary text-[13px] font-mono-medium">{formatCurrency(balance - stakeNum)}</MonoText>
                </View>
                <Button
                  label="Place Simulated Bet"
                  fullWidth
                  className="mt-4"
                  disabled={stakeNum <= 0 || stakeNum > balance}
                  onPress={handlePlace}
                />
                {stakeNum > balance ? (
                  <Text className="text-loss text-[12px] text-center mt-2">Stake exceeds your virtual balance</Text>
                ) : null}
              </Card>
            ) : (
              <View>
                {slip.map((s) => (
                  <View key={s.id} className="flex-row items-center justify-between bg-surface rounded-xl px-4 py-3 mb-2 border border-border">
                    <Text className="text-text-primary text-[13px] font-sans-medium flex-1 pr-3" numberOfLines={1}>
                      {s.selectionLabel}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-text-secondary text-[13px]">$</Text>
                      <TextInput
                        value={singleStakes[s.id] ?? ""}
                        onChangeText={(v) => setSingleStakes((prev) => ({ ...prev, [s.id]: v }))}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.textTertiary}
                        className="text-text-primary font-mono-medium text-[14px] text-right min-w-[50px]"
                      />
                    </View>
                  </View>
                ))}
                <Card className="p-4 mt-2">
                  <View className="flex-row items-center justify-between py-1">
                    <Text className="text-text-secondary text-[13px]">Total stake</Text>
                    <MonoText className="text-text-primary text-[14px] font-mono-medium">{formatCurrency(singlesTotal)}</MonoText>
                  </View>
                  <Button
                    label="Place Simulated Bets"
                    fullWidth
                    className="mt-3"
                    disabled={singlesTotal <= 0 || singlesTotal > balance}
                    onPress={handlePlace}
                  />
                  {singlesTotal > balance ? (
                    <Text className="text-loss text-[12px] text-center mt-2">Total stake exceeds your virtual balance</Text>
                  ) : null}
                </Card>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
