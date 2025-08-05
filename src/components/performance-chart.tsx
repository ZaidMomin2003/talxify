"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { day: "Monday", score: 65 },
  { day: "Tuesday", score: 72 },
  { day: "Wednesday", score: 68 },
  { day: "Thursday", score: 81 },
  { day: "Friday", score: 79 },
  { day: "Saturday", score: 85 },
  { day: "Sunday", score: 92 },
]

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
}

export function PerformanceChart() {
  return (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[50, 100]}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="score"
                type="natural"
                fill="var(--color-score)"
                fillOpacity={0.4}
                stroke="var(--color-score)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
  )
}
