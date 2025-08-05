
"use client"

import {
  Area,
  AreaChart,
  Line,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Dot,
} from "recharts"

import {
  ChartContainer,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BarChart, Briefcase, Code } from "lucide-react";

const chartData = [
    { month: "Jun", interviews: 5, coding: 8 },
    { month: "Jul", interviews: 7, coding: 10 },
    { month: "Aug", interviews: 10, coding: 12 },
    { month: "Sep", interviews: 9, coding: 15 },
    { month: "Oct", interviews: 12, coding: 18 },
    { month: "Nov", interviews: 14, coding: 22 },
];

const chartConfig = {
  interviews: {
    label: "Interviews",
    color: "url(#colorInterviews)",
  },
  coding: {
    label: "Coding",
    color: "hsl(var(--muted-foreground))",
  },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2">
        {payload.map((pld: any, index: number) => (
            <div key={index} className="flex flex-col items-start gap-1.5 rounded-lg border border-border/50 bg-background/90 px-3 py-2 text-xs shadow-xl mb-2">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 shrink-0 rounded-[2px] bg-[--color-bg]" style={{ '--color-bg': index === 0 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--accent))' } as React.CSSProperties} />
                    <p className="font-medium text-foreground">{pld.dataKey === 'interviews' ? 'Interviews' : 'Coding Questions'}</p>
                </div>
                <p className="font-bold text-lg text-foreground/90">{pld.value}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
};


const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-25} y={10} width={50} height={30}>
            <div className="flex items-center justify-center bg-muted/50 rounded-full text-muted-foreground text-xs px-3 py-1">
                {payload.value}
            </div>
        </foreignObject>
      </g>
    );
};
  
const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    
    return (
        <g transform={`translate(${x},${y})`}>
            <foreignObject x={-40} y={-15} width={40} height={30}>
                <div className="flex items-center justify-center bg-muted/50 rounded-full text-muted-foreground text-xs px-3 py-1 w-fit ml-auto">
                    {payload.value}
                </div>
            </foreignObject>
        </g>
    );
};

export function PerformanceChart() {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(128,128,128,0.1)_0%,_rgba(0,0,0,0)_100%)] bg-no-repeat bg-[length:10px_10px] pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4 text-muted-foreground"/>
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
        </div>
        <Select>
            <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="This Year" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ComposedChart
                accessibilityLayer
                data={chartData}
                margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 40,
                }}
            >
            <defs>
                <linearGradient id="colorInterviews" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                </linearGradient>
                <pattern id="diagonalStripes" patternUnits="userSpaceOnUse" width="4" height="4">
                    <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />
                </pattern>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={<CustomXAxisTick />}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tick={<CustomYAxisTick />}
                domain={[0, 30]}
                ticks={[5, 10, 20, 30]}
            />
            <Tooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '5 5' }}
                content={<CustomTooltip />}
                wrapperStyle={{ outline: 'none' }}
            />
            <Area
                dataKey="coding"
                type="natural"
                fill="url(#diagonalStripes)"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                stackId="a"
                dot={false}
            />
            <Line
                dataKey="interviews"
                type="natural"
                stroke="url(#colorInterviews)"
                strokeWidth={3}
                dot={false}
                activeDot={(props) => {
                    const { cx, cy, stroke, payload } = props;
                    if (payload.month === 'Nov') {
                        return <Dot cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" stroke="#fff" strokeWidth={2} />;
                    }
                    return null;
                }}
            />
            <ReferenceLine x="Nov" stroke="hsl(var(--border))" strokeWidth={1} />
            </ComposedChart>
        </ChartContainer>
      </CardContent>
    </div>
  )
}
