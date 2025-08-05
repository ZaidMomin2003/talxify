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
import { BarChart } from "lucide-react";

const chartData = [
    { month: "Jun", yourGrowth: 25000, comparison: 45000 },
    { month: "Jul", yourGrowth: 40000, comparison: 55000 },
    { month: "Aug", yourGrowth: 50000, comparison: 60000 },
    { month: "Sep", yourGrowth: 75000, comparison: 50000 },
    { month: "Oct", yourGrowth: 120000, comparison: 40000 },
    { month: "Nov", yourGrowth: 154002, comparison: 65698 },
];

const chartConfig = {
  yourGrowth: {
    label: "Your Growth",
    color: "url(#colorYourGrowth)",
  },
  comparison: {
    label: "Comparison",
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
                    <span className="w-2.5 h-2.5 shrink-0 rounded-[2px] bg-[--color-bg]" style={{ '--color-bg': index === 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))' } as React.CSSProperties} />
                    <p className="font-medium text-foreground">{pld.dataKey === 'yourGrowth' ? 'Annual Growth' : 'Comparison Data'}</p>
                </div>
                <p className="font-bold text-lg text-foreground/90">${pld.value.toLocaleString()}</p>
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
            <foreignObject x={-60} y={-15} width={60} height={30}>
                <div className="flex items-center justify-center bg-muted/50 rounded-full text-muted-foreground text-xs px-3 py-1 w-fit ml-auto">
                    ${payload.value / 1000}K
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
            <CardTitle className="text-sm font-medium">Annual Growth</CardTitle>
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
                    right: 40,
                    left: 20,
                    bottom: 40,
                }}
            >
            <defs>
                <linearGradient id="colorYourGrowth" x1="0" y1="0" x2="1" y2="0">
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
                padding={{ left: 20, right: 20 }}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tick={<CustomYAxisTick />}
                domain={[0, 200000]}
                ticks={[25000, 50000, 100000, 200000]}
            />
            <Tooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '5 5' }}
                content={<CustomTooltip />}
                wrapperStyle={{ outline: 'none' }}
            />
            <Area
                dataKey="comparison"
                type="natural"
                fill="url(#diagonalStripes)"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                stackId="a"
                dot={false}
            />
            <Line
                dataKey="yourGrowth"
                type="natural"
                stroke="url(#colorYourGrowth)"
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
