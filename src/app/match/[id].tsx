import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { Text, MonoText } from "@/components/ui/Text";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { MarketSectionCard, OddsButton, ResultBanner } from "@/components/betting";
import { kickoffTime } from "@/components/matches";
import { colors } from "@/constants/theme";
import { formatDate, formatCurrency, formatOdds } from "@/utils/format";
import { getMatchById } from "@/data/mock/eventGenerator";
import { buildOddsBoard } from "@/features/betting/selections";
import { computeStandings } from "@/features/stats/standings";
import { getHeadToHead, summarizeH2H } from "@/features/stats/h2h";
import { COMPETITIONS } from "@/data/mock/reference";
import { useApp } from "@/state/AppProvider";
import type { BetSlipSelection, MarketId, Selection } from "@/types";

type TabKey = "odds" | "form" | "h2h" | "standings";

function FormChip({ r }: { r: "W" | "L" | "D" }) {
  const bg = r === "W" ? "bg-profit" : r === "L" ? "bg-loss" : "bg-text-tertiary";
  return (
    <View className={`w-6 h-6 rounded-full items-center justify-center ${bg}`}>
      <Text className="text-white text-[10px] font-sans-bold">{r}</Text>
    </View>
  );
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = getMatchById(id);
  const [tab, setTab] = useState<TabKey>("odds");
  const { slip, toggleSlipSelection, favouriteTeamIds, toggleFavouriteTeam, bets, revealBet } = useApp();

  const oddsBoard = useMemo(() => (match ? buildOddsBoard(match) : []), [match]);
  const standings = useMemo(() => (match ? computeStandings(match.competitionId, match.date) : []), [match]);
  const h2h = useMemo(() => (match ? getHeadToHead(match.home.id, match.away.id, match.date) : []), [match]);
  const h2hSummary = useMemo(() => (match ? summarizeH2H(match.home.id, h2h) : { teamAWins: 0, teamBWins: 0, draws: 0 }), [match, h2h]);

  // A settled bet that covers this exact match, if any — drives the reveal UI.
  const relatedBet = useMemo(() => {
    if (!match) return undefined;
    return bets.find((b) => b.selections.some((s) => s.matchId === match.id));
  }, [bets, match]);
  const relatedSelection = relatedBet?.selections.find((s) => s.matchId === match?.id);

  if (!match) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-canvas">
        <ErrorState message="This match could not be found." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  const competition = COMPETITIONS.find((c) => c.id === match.competitionId);
  const isFavourited = favouriteTeamIds.includes(match.home.id) || favouriteTeamIds.includes(match.away.id);

  function handleSelect(marketId: MarketId, marketName: string, s: Selection) {
    const payload: BetSlipSelection = {
      id: `slip-${match!.id}-${marketId}-${s.key}-${s.line ?? ""}`,
      matchId: match!.id,
      sportId: match!.sportId,
      eventLabel: `${match!.home.name} vs ${match!.away.name}`,
      competitionName: competition?.name ?? "",
      marketId,
      marketName,
      selectionKey: s.key,
      line: s.line,
      selectionLabel: s.label,
      odds: s.odds,
    };
    toggleSlipSelection(payload);
  }

  const revealed = relatedBet?.status === "won" || relatedBet?.status === "lost";

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} className="bg-headerBlue">
        <View className="flex-row items-center justify-between px-4 pt-2">
          <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center">
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View className="flex-row items-center gap-1">
            <Pressable hitSlop={8} className="w-9 h-9 items-center justify-center">
              <Ionicons name="share-outline" size={19} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => toggleFavouriteTeam(match.home.id)}
              hitSlop={8}
              className="w-9 h-9 items-center justify-center"
            >
              <Ionicons name={isFavourited ? "star" : "star-outline"} size={19} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center justify-between px-6 pt-1 pb-5">
          <View className="items-center flex-1">
            <TeamAvatar name={match.home.name} size={48} />
            <Text className="text-white text-[13px] font-sans-semibold mt-2 text-center" numberOfLines={2}>
              {match.home.name}
            </Text>
          </View>
          <View className="items-center px-2">
            {revealed ? (
              <>
                <MonoText className="text-white text-[24px] font-mono-bold">
                  {match.result.homeScore} - {match.result.awayScore}
                </MonoText>
                <Text className="text-white/70 text-[11px] mt-0.5">Full time</Text>
              </>
            ) : (
              <>
                <Text className="text-white text-[17px] font-sans-bold">{kickoffTime(match.id)}</Text>
                <Text className="text-white/70 text-[12px] mt-0.5">{formatDate(match.date)}</Text>
              </>
            )}
          </View>
          <View className="items-center flex-1">
            <TeamAvatar name={match.away.name} size={48} />
            <Text className="text-white text-[13px] font-sans-semibold mt-2 text-center" numberOfLines={2}>
              {match.away.name}
            </Text>
          </View>
        </View>

        <View className="flex-row px-2">
          {(
            [
              { key: "odds", label: "Odds" },
              { key: "form", label: "Form" },
              { key: "h2h", label: "H2H" },
              { key: "standings", label: "Standings" },
            ] as { key: TabKey; label: string }[]
          ).map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} className="flex-1 items-center pb-3">
                <Text className={`text-[13.5px] ${active ? "text-white font-sans-bold" : "text-white/60 font-sans-medium"}`}>
                  {t.label}
                </Text>
                <View className={`h-[3px] w-8 rounded-full mt-2 ${active ? "bg-white" : "bg-transparent"}`} />
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} className="bg-canvas">
        <View className="px-5 pt-4">
          <View className="flex-row items-center justify-between bg-surface rounded-card px-4 py-3.5 mb-4">
            <Text className="text-text-primary text-[13px] font-sans-medium flex-1" numberOfLines={1}>
              {SPORT_LABEL(match.sportId)} · {competition?.country} · {competition?.name}
            </Text>
          </View>

          {relatedBet ? (
            <Card className="p-4 mb-4">
              {revealed ? (
                <>
                  <ResultBanner status={relatedBet.status as "won" | "lost"} profit={relatedBet.profit ?? 0} />
                  <View className="mt-4">
                    <Text className="text-text-secondary text-[12px] text-center">Your prediction</Text>
                    <Text className="text-text-primary text-[14px] font-sans-semibold text-center mt-1">
                      {relatedSelection?.selectionLabel} @ {formatOdds(relatedSelection?.odds ?? 0)}
                    </Text>
                  </View>
                </>
              ) : (
                <View className="items-center py-2">
                  <Ionicons name="lock-closed-outline" size={22} color={colors.textTertiary} />
                  <Text className="text-text-primary font-sans-semibold text-[14px] mt-2">Prediction placed</Text>
                  <Text className="text-text-secondary text-[12.5px] text-center mt-1">
                    {relatedSelection?.selectionLabel} @ {formatOdds(relatedSelection?.odds ?? 0)} · Stake {formatCurrency(relatedBet.stake)}
                  </Text>
                  <Button label="Reveal Result" icon="eye-outline" onPress={() => revealBet(relatedBet.id)} className="mt-4" />
                </View>
              )}
            </Card>
          ) : null}

          {tab === "odds" ? (
            <>
              {revealed ? (
                <Text className="text-text-tertiary text-[12.5px] text-center mb-4">
                  This match has been revealed — odds are shown for reference only.
                </Text>
              ) : null}
              {oddsBoard.map((section) => (
                <MarketSectionCard key={section.market.id} title={section.market.name}>
                  <View className="flex-row gap-2">
                    {section.selections.map((s) => {
                      const active = slip.some(
                        (sl) => sl.matchId === match.id && sl.marketId === section.market.id && sl.selectionKey === s.key && sl.line === s.line
                      );
                      return (
                        <OddsButton
                          key={s.key}
                          selection={s}
                          active={active}
                          onPress={() => handleSelect(section.market.id, section.market.name, s)}
                        />
                      );
                    })}
                  </View>
                </MarketSectionCard>
              ))}
            </>
          ) : null}

          {tab === "form" ? (
            <Card className="p-4 mb-4">
              <Text className="text-text-primary font-sans-bold text-[15px] mb-3">Recent form (before this match)</Text>
              <View className="flex-row items-center justify-between">
                <View className="items-center flex-1">
                  <Text className="text-text-secondary text-[12px] mb-2" numberOfLines={1}>
                    {match.home.name}
                  </Text>
                  <View className="flex-row gap-1.5">
                    {match.home.form.length === 0 ? (
                      <Text className="text-text-tertiary text-[11px]">No prior data</Text>
                    ) : (
                      match.home.form.map((r, i) => <FormChip key={i} r={r} />)
                    )}
                  </View>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-text-secondary text-[12px] mb-2" numberOfLines={1}>
                    {match.away.name}
                  </Text>
                  <View className="flex-row gap-1.5">
                    {match.away.form.length === 0 ? (
                      <Text className="text-text-tertiary text-[11px]">No prior data</Text>
                    ) : (
                      match.away.form.map((r, i) => <FormChip key={i} r={r} />)
                    )}
                  </View>
                </View>
              </View>
            </Card>
          ) : null}

          {tab === "h2h" ? (
            <Card className="p-4 mb-4">
              <Text className="text-text-primary font-sans-bold text-[15px] mb-3">Head-to-head (before this match)</Text>
              {h2h.length === 0 ? (
                <Text className="text-text-tertiary text-[13px]">No previous meetings in the dataset.</Text>
              ) : (
                <>
                  <View className="flex-row items-center justify-around mb-4">
                    <View className="items-center">
                      <MonoText className="text-[18px] font-mono-bold text-text-primary">{h2hSummary.teamAWins}</MonoText>
                      <Text className="text-text-tertiary text-[11px] mt-0.5">{match.home.shortName} wins</Text>
                    </View>
                    <View className="items-center">
                      <MonoText className="text-[18px] font-mono-bold text-text-secondary">{h2hSummary.draws}</MonoText>
                      <Text className="text-text-tertiary text-[11px] mt-0.5">Draws</Text>
                    </View>
                    <View className="items-center">
                      <MonoText className="text-[18px] font-mono-bold text-text-primary">{h2hSummary.teamBWins}</MonoText>
                      <Text className="text-text-tertiary text-[11px] mt-0.5">{match.away.shortName} wins</Text>
                    </View>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {h2h.slice(0, 8).map((m) => (
                      <View key={m.match.id} className="bg-surfaceInset rounded-lg px-2.5 py-1.5">
                        <Text className="text-text-secondary text-[11px] font-sans-medium">{m.scoreLabel}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Card>
          ) : null}

          {tab === "standings" ? (
            <Card className="p-4 mb-4">
              <Text className="text-text-primary font-sans-bold text-[15px] mb-3">Standings before this match</Text>
              {standings.length === 0 ? (
                <Text className="text-text-tertiary text-[13px]">No standings data yet this early in the dataset.</Text>
              ) : (
                <>
                  <View className="flex-row items-center justify-between px-1 pb-2">
                    <Text className="text-text-tertiary text-[11px] flex-1">Team</Text>
                    <Text className="text-text-tertiary text-[11px] w-8 text-center">P</Text>
                    <Text className="text-text-tertiary text-[11px] w-10 text-center">Diff</Text>
                    <Text className="text-text-tertiary text-[11px] w-10 text-center">PTS</Text>
                  </View>
                  {standings.slice(0, 8).map((row, idx) => {
                    const highlight = row.teamId === match.home.id || row.teamId === match.away.id;
                    return (
                      <View
                        key={row.teamId}
                        className={`flex-row items-center justify-between px-1 py-2.5 border-t border-border ${highlight ? "bg-edge/5" : ""}`}
                      >
                        <View className="flex-row items-center gap-2.5 flex-1">
                          <Text className="text-text-tertiary text-[12px] w-5">{idx + 1}</Text>
                          <TeamAvatar name={row.teamName} size={20} />
                          <Text className="text-text-primary text-[12.5px] font-sans-medium flex-1" numberOfLines={1}>
                            {row.teamName}
                          </Text>
                        </View>
                        <Text className="text-text-secondary text-[12px] w-8 text-center">{row.played}</Text>
                        <Text className="text-text-secondary text-[12px] w-10 text-center">
                          {row.diff > 0 ? "+" : ""}
                          {row.diff}
                        </Text>
                        <MonoText className="text-text-primary text-[12px] font-mono-medium w-10 text-center">{row.points}</MonoText>
                      </View>
                    );
                  })}
                </>
              )}
            </Card>
          ) : null}
        </View>
      </ScrollView>

      {tab === "odds" && !relatedBet ? (
        <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border px-5 pt-3">
          <Button
            label={slip.length > 0 ? `View Bet Slip (${slip.length})` : "Select a market to begin"}
            fullWidth
            disabled={slip.length === 0}
            onPress={() => router.push("/(tabs)/slip")}
          />
        </SafeAreaView>
      ) : null}
    </View>
  );
}

function SPORT_LABEL(sportId: string): string {
  return sportId[0].toUpperCase() + sportId.slice(1);
}
