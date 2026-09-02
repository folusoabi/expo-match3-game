import React, { useMemo, useState } from "react";
import { View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FieldRow, NumberFieldRow, SectionLabel } from "@/components/ui/FieldRow";
import { SelectSheet, SelectSheetOption } from "@/components/ui/SelectSheet";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/theme";
import { SPORTS, LEAGUES, BOOKMAKERS, leaguesForSport } from "@/data/mock/reference";
import { marketsForSport, getMarket } from "@/data/mock/markets";
import { getDatasetRange } from "@/data/mock/eventGenerator";
import { useBacktestStore } from "@/state/BacktestProvider";
import type { FavouriteFilter, FormFilter, HomeAwayFilter, MarketId, SportId, StakeType, StrategyConfig } from "@/types";

const range = getDatasetRange();

function monthsBack(months: number): string {
  const end = new Date(range.to);
  end.setMonth(end.getMonth() - months);
  const clamped = end < new Date(range.from) ? range.from : end.toISOString().slice(0, 10);
  return clamped;
}

const DATE_PRESETS: SelectSheetOption[] = [
  { label: "Last 3 months", value: "3" },
  { label: "Last 6 months", value: "6" },
  { label: "Last 12 months", value: "12" },
  { label: "Last 24 months", value: "24" },
  { label: "Full dataset (Jan 2024 – Aug 2026)", value: "full" },
];

type SheetKind = "league" | "market" | "selection" | "line" | "bookmaker" | "dateRange" | null;

export default function BacktestBuilderScreen() {
  const { runAndRecord, saveStrategy } = useBacktestStore();

  const [sportId, setSportId] = useState<SportId>("football");
  const [leagueId, setLeagueId] = useState(leaguesForSport("football")[0].id);
  const [marketId, setMarketId] = useState(marketsForSport("football")[0].id);
  const [selection, setSelection] = useState(marketsForSport("football")[0].selections[0]);
  const [line, setLine] = useState<number | undefined>(undefined);
  const [bookmaker, setBookmaker] = useState(BOOKMAKERS[0]);
  const [datePreset, setDatePreset] = useState("12");
  const [bankroll, setBankroll] = useState("1000");
  const [stakeType, setStakeType] = useState<StakeType>("percentage");
  const [stakeValue, setStakeValue] = useState("2");
  const [minOdds, setMinOdds] = useState("1.10");
  const [maxOdds, setMaxOdds] = useState("10");
  const [favourite, setFavourite] = useState<FavouriteFilter>("any");
  const [homeAway, setHomeAway] = useState<HomeAwayFilter>("any");
  const [form, setForm] = useState<FormFilter>("any");
  const [saveAsStrategy, setSaveAsStrategy] = useState(true);
  const [strategyName, setStrategyName] = useState("");
  const [running, setRunning] = useState(false);
  const [sheet, setSheet] = useState<SheetKind>(null);

  const leagues = useMemo(() => leaguesForSport(sportId), [sportId]);
  const markets = useMemo(() => marketsForSport(sportId), [sportId]);
  const market = useMemo(() => getMarket(marketId), [marketId]);
  const league = LEAGUES.find((l) => l.id === leagueId);

  function onSportChange(value: string) {
    const sid = value as SportId;
    setSportId(sid);
    const nextLeagues = leaguesForSport(sid);
    setLeagueId(nextLeagues[0].id);
    const nextMarkets = marketsForSport(sid);
    setMarketId(nextMarkets[0].id);
    setSelection(nextMarkets[0].selections[0]);
    setLine(nextMarkets[0].hasLine ? nextMarkets[0].defaultLines?.[0] : undefined);
  }

  function onMarketChange(value: string) {
    const m = getMarket(value);
    setMarketId(value as MarketId);
    setSelection(m?.selections[0] ?? "");
    setLine(m?.hasLine ? m?.defaultLines?.[0] : undefined);
    setSheet(null);
  }

  const dateFrom = datePreset === "full" ? range.from : monthsBack(parseInt(datePreset, 10));
  const dateTo = range.to;

  const defaultName = `${league?.shortName ?? ""} ${market?.name ?? ""} ${selection}`.trim();

  async function handleRun() {
    setRunning(true);
    try {
      const config: StrategyConfig = {
        id: `strategy-${Date.now()}`,
        name: strategyName.trim() || defaultName,
        sportId,
        leagueId,
        marketId,
        selection,
        line,
        bookmaker,
        dateFrom,
        dateTo,
        startingBankroll: parseFloat(bankroll) || 1000,
        stakeType,
        stakeValue: parseFloat(stakeValue) || 1,
        filters: {
          favourite,
          homeAway,
          form,
          minOdds: parseFloat(minOdds) || 1.01,
          maxOdds: parseFloat(maxOdds) || 100,
        },
        createdAt: new Date().toISOString(),
      };

      if (saveAsStrategy) saveStrategy(config);
      const result = await runAndRecord(config, { persistToStrategy: saveAsStrategy });
      router.replace(`/(tabs)/backtests/results/${result.id}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
      <ScreenHeader title="New Backtest" subtitle="Configure a strategy to test" showBack onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <SectionLabel>Sport</SectionLabel>
          <SegmentedControl
            options={SPORTS.map((s) => ({ label: s.name, value: s.id }))}
            value={sportId}
            onChange={onSportChange}
          />

          <SectionLabel>Market setup</SectionLabel>
          <Card>
            <FieldRow label="League" value={league?.name ?? ""} onPress={() => setSheet("league")} icon="trophy-outline" />
            <FieldRow label="Market" value={market?.name ?? ""} onPress={() => setSheet("market")} icon="stats-chart-outline" />
            <FieldRow label="Selection" value={selection} onPress={() => setSheet("selection")} icon="checkmark-done-outline" />
            {market?.hasLine ? (
              <FieldRow
                label="Line"
                value={line !== undefined ? (line > 0 ? `+${line}` : `${line}`) : "Select"}
                onPress={() => setSheet("line")}
                icon="git-compare-outline"
              />
            ) : null}
            <FieldRow label="Bookmaker" value={bookmaker} onPress={() => setSheet("bookmaker")} icon="storefront-outline" />
          </Card>

          <SectionLabel>Historical range</SectionLabel>
          <Card>
            <FieldRow
              label="Date range"
              value={DATE_PRESETS.find((p) => p.value === datePreset)?.label ?? ""}
              onPress={() => setSheet("dateRange")}
              icon="calendar-outline"
            />
          </Card>

          <SectionLabel>Odds range</SectionLabel>
          <Card>
            <NumberFieldRow label="Minimum odds" value={minOdds} onChangeText={setMinOdds} />
            <NumberFieldRow label="Maximum odds" value={maxOdds} onChangeText={setMaxOdds} />
          </Card>

          <SectionLabel>Bankroll & staking</SectionLabel>
          <Card>
            <NumberFieldRow label="Starting bankroll" value={bankroll} onChangeText={setBankroll} suffix="$" />
            <View className="px-4 py-3.5 border-b border-border">
              <Text className="text-text-secondary text-[13.5px] font-sans-medium mb-2.5">Stake type</Text>
              <SegmentedControl
                options={[
                  { label: "Fixed amount", value: "fixed" },
                  { label: "% of bankroll", value: "percentage" },
                ]}
                value={stakeType}
                onChange={(v) => setStakeType(v as StakeType)}
              />
            </View>
            <NumberFieldRow
              label={stakeType === "fixed" ? "Stake amount" : "Stake percentage"}
              value={stakeValue}
              onChangeText={setStakeValue}
              suffix={stakeType === "fixed" ? "$" : "%"}
            />
          </Card>

          <SectionLabel>Advanced filters</SectionLabel>
          <Card className="p-4">
            <Text className="text-text-secondary text-[13.5px] font-sans-medium mb-2.5">Favourite / underdog</Text>
            <SegmentedControl
              options={[
                { label: "Any", value: "any" },
                { label: "Favourite", value: "favourite" },
                { label: "Underdog", value: "underdog" },
              ]}
              value={favourite}
              onChange={(v) => setFavourite(v as FavouriteFilter)}
            />
            <Text className="text-text-secondary text-[13.5px] font-sans-medium mb-2.5 mt-4">Home / away</Text>
            <SegmentedControl
              options={[
                { label: "Any", value: "any" },
                { label: "Home", value: "home" },
                { label: "Away", value: "away" },
              ]}
              value={homeAway}
              onChange={(v) => setHomeAway(v as HomeAwayFilter)}
            />
            <Text className="text-text-secondary text-[13.5px] font-sans-medium mb-2.5 mt-4">Recent form</Text>
            <SegmentedControl
              options={[
                { label: "Any", value: "any" },
                { label: "Hot (3+ W)", value: "hot" },
                { label: "Cold", value: "cold" },
              ]}
              value={form}
              onChange={(v) => setForm(v as FormFilter)}
            />
          </Card>

          <SectionLabel>Strategy name</SectionLabel>
          <Card className="px-4 py-1">
            <TextInput
              value={strategyName}
              onChangeText={setStrategyName}
              placeholder={defaultName}
              placeholderTextColor={colors.textTertiary}
              className="text-text-primary font-sans-medium text-[14.5px] py-3"
            />
          </Card>

          <Pressable
            onPress={() => setSaveAsStrategy((v) => !v)}
            className="flex-row items-center gap-3 px-1 py-4"
          >
            <Ionicons
              name={saveAsStrategy ? "checkbox" : "square-outline"}
              size={21}
              color={saveAsStrategy ? colors.edge : colors.textTertiary}
            />
            <Text className="text-text-secondary text-[13.5px] flex-1">Save this configuration as a strategy so you can rerun it later</Text>
          </Pressable>

          <Button label="Run Backtest" icon="play" fullWidth onPress={handleRun} loading={running} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectSheet
        visible={sheet === "league"}
        title="Select league"
        options={leagues.map((l) => ({ label: l.name, value: l.id, sublabel: l.country }))}
        selected={leagueId}
        onSelect={(v) => {
          setLeagueId(v);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === "market"}
        title="Select market"
        options={markets.map((m) => ({ label: m.name, value: m.id }))}
        selected={marketId}
        onSelect={onMarketChange}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === "selection"}
        title="Select selection"
        options={(market?.selections ?? []).map((s) => ({ label: s, value: s }))}
        selected={selection}
        onSelect={(v) => {
          setSelection(v);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === "line"}
        title="Select line"
        options={(market?.defaultLines ?? []).map((l) => ({ label: l > 0 ? `+${l}` : `${l}`, value: String(l) }))}
        selected={line !== undefined ? String(line) : ""}
        onSelect={(v) => {
          setLine(parseFloat(v));
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === "bookmaker"}
        title="Select bookmaker"
        options={BOOKMAKERS.map((b) => ({ label: b, value: b }))}
        selected={bookmaker}
        onSelect={(v) => {
          setBookmaker(v);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === "dateRange"}
        title="Historical date range"
        options={DATE_PRESETS}
        selected={datePreset}
        onSelect={(v) => {
          setDatePreset(v);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
    </SafeAreaView>
  );
}
