import PluginManagerComponent from '@/components/plugin-manager'

export default function PluginsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Plugins</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage and configure monitoring plugins
        </p>
      </div>
      <PluginManagerComponent />
    </div>
  )
}
