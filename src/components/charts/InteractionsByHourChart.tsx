import {
  BarChart, Bar, CartesianGrid, Tooltip, Legend, XAxis, YAxis, ResponsiveContainer,
} from "recharts";
import type { HourSlot } from "@/utils/chatbot_metrics";
import { getChartTheme } from "./chartTheme";

type Props = {
  data: HourSlot[];
  compare: boolean;
  dark: boolean;
  colors: { 
    ALL: string;
    ALL_OUT: string; 
    FREE: string; 
    FREE_OUT: string; 
    CONTEXT: string 
    CTX_OUT: string  
  };
  singleColor?: string;
};

export default function InteractionsByHourChart({
  data,
  compare,
  dark,
  colors,
  singleColor
}: Readonly<Props>) {
  const theme = getChartTheme(dark);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" interval={2} />
        <YAxis allowDecimals={false} />
        <Tooltip
          contentStyle={theme.tooltip.contentStyle}
          labelStyle={theme.tooltip.labelStyle}
          itemStyle={theme.tooltip.itemStyle}
          cursor={{ fill: theme.cursorFill }}
        />
        <Legend />
        {compare ? (
          <>
            <Bar dataKey="countFree" name="Free" fill={colors.FREE} />
            <Bar dataKey="countContext" name="Context" fill={colors.CONTEXT} />
          </>
        ) : (
          <Bar dataKey="countAll" name="Interactions" fill={singleColor ?? colors.ALL_OUT} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
