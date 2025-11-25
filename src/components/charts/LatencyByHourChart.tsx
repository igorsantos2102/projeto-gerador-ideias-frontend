import {
  LineChart, Line, CartesianGrid, Tooltip, Legend, XAxis, YAxis, ResponsiveContainer,
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

export default function LatencyByHourChart({
  data,
  compare,
  dark,
  colors,
  singleColor,
}: Readonly<Props>) {
  const theme = getChartTheme(dark);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" interval={2} />
        <YAxis />
        <Tooltip
          contentStyle={theme.tooltip.contentStyle}
          labelStyle={theme.tooltip.labelStyle}
          itemStyle={theme.tooltip.itemStyle}
          cursor={{ fill: theme.cursorFill }}
        />
        <Legend />
        {compare ? (
          <>
            <Line type="monotone" dataKey="avgRtFree"    name="Free Avg RT" stroke={colors.FREE}    dot={false} />
            <Line type="monotone" dataKey="avgRtContext" name="Ctx  Avg RT" stroke={colors.CONTEXT} dot={false} />
          </>
        ) : (
          <Line type="monotone" dataKey="avgRtAll" name="Avg RT (ms)" stroke={singleColor ?? colors.ALL} dot={false} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
