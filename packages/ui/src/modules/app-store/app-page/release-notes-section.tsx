import {cn} from '@/shadcn-lib/utils'
import {RegistryApp} from '@/trpc/trpc'
import {t} from '@/utils/i18n'
import {tw} from '@/utils/tw'

import {cardClass, cardTitleClass, ReadMoreMarkdownSection} from './shared'

export const ReleaseNotesSection = ({app}: {app: RegistryApp}) => (
	<>
		{app.releaseNotes && (
			<div className={cn(cardClass, 'gap-2.5')}>
				<h2 className={cardTitleClass}>{t('app-page.section.release-notes.title')}</h2>
				<h3 className='text-16 font-semibold'>{t('app-page.section.release-notes.version', {version: app.version})}</h3>
				<ReadMoreMarkdownSection collapseClassName={tw`line-clamp-10`}>{app.releaseNotes}</ReadMoreMarkdownSection>
			</div>
		)}
	</>
)
