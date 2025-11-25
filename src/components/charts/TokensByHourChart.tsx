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
  singleColorSecondary?: string;
};

export default function TokensByHourChart({
  data,
  compare,
  dark,
  colors,
  singleColor,
  singleColorSecondary,
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
            <Line type="monotone" dataKey="tokensInFree"     name="Free In"  stroke={colors.FREE}    dot={false} />
            <Line type="monotone" dataKey="tokensOutFree"    name="Free Out" stroke={colors.FREE_OUT}       dot={false} />
            <Line type="monotone" dataKey="tokensInContext"  name="Ctx In"   stroke={colors.CONTEXT} dot={false} />
            <Line type="monotone" dataKey="tokensOutContext" name="Ctx Out"  stroke={colors.CTX_OUT}        dot={false} />
          </>
        ) : (
          <>
            <Line type="monotone" dataKey="tokensInAll"  name="Tokens In"  stroke={singleColor ?? colors.ALL} dot={false} />
            <Line type="monotone" dataKey="tokensOutAll" name="Tokens Out" stroke={singleColorSecondary ?? colors.ALL_OUT}    dot={false} />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
