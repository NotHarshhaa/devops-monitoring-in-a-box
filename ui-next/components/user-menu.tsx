'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserIcon,
  Settings01Icon,
  Logout01Icon,
  Shield01Icon,
  UserGroupIcon,
  EyeIcon,
  CrownIcon
} from '@hugeicons/core-free-icons'

function RoleIcon({ role }: { role?: string }) {
  switch (role) {
    case 'ADMIN':
      return <HugeiconsIcon icon={CrownIcon} className="size-3" />
    case 'EDITOR':
      return <HugeiconsIcon icon={Shield01Icon} className="size-3" />
    case 'VIEWER':
      return <HugeiconsIcon icon={EyeIcon} className="size-3" />
    default:
      return <HugeiconsIcon icon={UserIcon} className="size-3" />
  }
}

export function UserMenu() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session?.user) return null

  const role = (session.user as { role?: string }).role
  const initial =
    session.user.name?.charAt(0).toUpperCase() ||
    session.user.email?.charAt(0).toUpperCase() ||
    'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative size-9">
          <Avatar className="size-7">
            <AvatarImage
              src={session.user.image || ''}
              alt={session.user.name || ''}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background bg-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 border-border bg-card p-0" align="end">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage
                src={session.user.image || ''}
                alt={session.user.name || ''}
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {session.user.name || 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session.user.email}
              </p>
              {role && (
                <Badge variant="outline" className="mt-2 gap-1 text-[10px]">
                  <RoleIcon role={role} />
                  {role}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="p-1">
          <DropdownMenuLabel className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Account
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            <HugeiconsIcon icon={UserIcon} className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <HugeiconsIcon icon={Settings01Icon} className="size-4" />
            Settings
          </DropdownMenuItem>

          {role === 'ADMIN' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                Admin
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push('/admin')}>
                <HugeiconsIcon icon={Shield01Icon} className="size-4" />
                Admin Panel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
                User Management
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          >
            <HugeiconsIcon icon={Logout01Icon} className="size-4" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
