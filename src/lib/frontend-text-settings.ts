import { ADMIN_API_URL } from './api-config'

export const frontendTextDefaults = {
  frontend_publisher_home_title: 'Classy News',
  frontend_publisher_home_subtitle: 'The Publisher Dashboard for Classy News',
  frontend_publisher_home_description:
    'Classy News is a news application and website for reading the latest breaking news, politics, entertainment, sports, and lifestyle stories, and watching live TV and radio - all in one place. This dashboard allows publishers to create, manage, and publish news articles on the Classy News platform.',
  frontend_publisher_home_cta_note: 'Ready to get started? Sign in to your account',
  frontend_publisher_login_title: 'Classy News',
  frontend_publisher_login_description:
    'Classy News is a news application and website for reading the latest breaking news, politics, entertainment, sports, and lifestyle stories. This publisher dashboard allows you to create, manage, and publish news articles on the Classy News platform.',
  frontend_publisher_login_features: 'Publish articles instantly\nTrack your analytics\nGrow your audience',
  frontend_publisher_login_form_title: 'Welcome back',
  frontend_publisher_login_form_subtitle: 'Sign in to your creator account',
  frontend_publisher_register_title: 'ClassinNews',
  frontend_publisher_register_description: 'Start your journey as a content creator and reach millions of readers.',
  frontend_publisher_register_features: 'Publish articles instantly\nEarn from your content\nBuild your brand',
  frontend_publisher_register_form_title: 'Create your account',
  frontend_publisher_register_form_subtitle: 'Join ClassinNews as a publisher',
}

export type FrontendTextSettings = typeof frontendTextDefaults

const mapSettingsResponse = (data: any): Partial<FrontendTextSettings> => {
  const raw = data?.data ?? data
  if (Array.isArray(raw)) {
    return raw.reduce((acc, item) => {
      if (item?.key && typeof item.value === 'string') {
        acc[item.key as keyof FrontendTextSettings] = item.value
      }
      return acc
    }, {} as Partial<FrontendTextSettings>)
  }

  if (raw && typeof raw === 'object') {
    return raw as Partial<FrontendTextSettings>
  }

  return {}
}

export const fetchFrontendTextSettings = async (): Promise<FrontendTextSettings> => {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/settings/public/frontend_text`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return frontendTextDefaults
    }

    const data = await response.json()
    return {
      ...frontendTextDefaults,
      ...mapSettingsResponse(data),
    }
  } catch {
    return frontendTextDefaults
  }
}

export const settingLines = (value: string, fallback: string) =>
  (value || fallback)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
