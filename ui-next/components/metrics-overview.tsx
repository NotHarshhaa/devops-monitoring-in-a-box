import React from "react";
import { motion } from "framer-motion";
import { Cpu, Database, HardDrive, Network, Activity } from "lucide-react";
import { MetricsCard } from "./metrics-card";
import { 
  useCPUUsage, 
  useMemoryUsage, 
  useDiskUsage, 
  useNetworkTraffic, 
  useSystemLoad 
} from "@/lib/hooks/use-prometheus-metrics";

export function MetricsOverview() {
  const cpuUsage = useCPUUsage();
  const memoryUsage = useMemoryUsage();
  const diskUsage = useDiskUsage();
  const networkTraffic = useNetworkTraffic();
  const systemLoad = useSystemLoad();

  // Determine trend and color based on usage values
  const getTrendAndColor = (usage: number) => {
    if (usage >= 80) return { trend: 'up' as const, color: 'danger' as const };
    if (usage >= 60) return { trend: 'up' as const, color: 'warning' as const };
    return { trend: 'down' as const, color: 'success' as const };
  };

  const cpuTrend = getTrendAndColor(cpuUsage.data || 0);
  const memoryTrend = getTrendAndColor(memoryUsage.data || 0);
  const diskTrend = getTrendAndColor(diskUsage.data || 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <MetricsCard
          title="CPU Usage"
          description="Current CPU utilization"
          value={cpuUsage.data || 0}
          unit="%"
          percentage={cpuUsage.data || 0}
          trend={cpuTrend.trend}
          trendValue={cpuUsage.data ? `${cpuUsage.data.toFixed(1)}%` : undefined}
          isLoading={cpuUsage.isLoading}
          isError={cpuUsage.isError}
          errorMessage="Failed to load CPU usage"
          icon={<Cpu className="h-4 w-4" />}
          color={cpuTrend.color}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricsCard
          title="Memory Usage"
          description="Current RAM utilization"
          value={memoryUsage.data || 0}
          unit="%"
          percentage={memoryUsage.data || 0}
          trend={memoryTrend.trend}
          trendValue={memoryUsage.data ? `${memoryUsage.data.toFixed(1)}%` : undefined}
          isLoading={memoryUsage.isLoading}
          isError={memoryUsage.isError}
          errorMessage="Failed to load memory usage"
          icon={<Database className="h-4 w-4" />}
          color={memoryTrend.color}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricsCard
          title="Disk Usage"
          description="Current storage utilization"
          value={diskUsage.data || 0}
          unit="%"
          percentage={diskUsage.data || 0}
          trend={diskTrend.trend}
          trendValue={diskUsage.data ? `${diskUsage.data.toFixed(1)}%` : undefined}
          isLoading={diskUsage.isLoading}
          isError={diskUsage.isError}
          errorMessage="Failed to load disk usage"
          icon={<HardDrive className="h-4 w-4" />}
          color={diskTrend.color}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricsCard
          title="Network Traffic"
          description="Current network throughput"
          value={networkTraffic.data ? networkTraffic.data.inbound + networkTraffic.data.outbound : 0}
          unit="MB/s"
          isLoading={networkTraffic.isLoading}
          isError={networkTraffic.isError}
          errorMessage="Failed to load network traffic"
          icon={<Network className="h-4 w-4" />}
        />
      </motion.div>
    </motion.div>
  );
}

export function SystemLoadOverview() {
  const systemLoad = useSystemLoad();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <MetricsCard
          title="1 Minute Load"
          description="System load average (1 min)"
          value={systemLoad.data?.load1 || 0}
          isLoading={systemLoad.isLoading}
          isError={systemLoad.isError}
          errorMessage="Failed to load system load"
          icon={<Activity className="h-4 w-4" />}
          color={systemLoad.data?.load1 && systemLoad.data.load1 > 1 ? 'warning' : 'default'}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricsCard
          title="5 Minute Load"
          description="System load average (5 min)"
          value={systemLoad.data?.load5 || 0}
          isLoading={systemLoad.isLoading}
          isError={systemLoad.isError}
          errorMessage="Failed to load system load"
          icon={<Activity className="h-4 w-4" />}
          color={systemLoad.data?.load5 && systemLoad.data.load5 > 1 ? 'warning' : 'default'}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <MetricsCard
          title="15 Minute Load"
          description="System load average (15 min)"
          value={systemLoad.data?.load15 || 0}
          isLoading={systemLoad.isLoading}
          isError={systemLoad.isError}
          errorMessage="Failed to load system load"
          icon={<Activity className="h-4 w-4" />}
          color={systemLoad.data?.load15 && systemLoad.data.load15 > 1 ? 'warning' : 'default'}
        />
      </motion.div>
    </motion.div>
  );
}
