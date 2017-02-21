anno_localizations ={
	'de': {
                'headline': 'Annotationen',
                'login': 'Anmelden',
                'new': 'Neue Annotation',
                'open_all': 'Alle öffnen',
                'close': 'Schließen',
                'close_all': 'Alle schließen',
                'sort': 'Sortieren',
                'edit': 'Editieren',
                'comment': 'Kommentieren',
                'commenttarget': 'Kommentar zu',
                'reply': 'Antworten',
                'comments': 'Kommentare',
                'previous': 'Vorherige Version',
                'sortdate': 'Chronologisch aufsteigend',
                'sortdatereverse': 'Chronologisch absteigend',
                'sorttitle': 'Titel aufsteigend',
                'save': 'Speichern',
                'cancel': 'Abbrechen',
                'edit_headline': 'Annotationen-Editor',
                'annofield_title': 'Titel (Pflichtfeld)',
                'annofield_link': 'Link (URL)',
                'annofield_linktitle': 'Link-Titel',
                'license': 'Annotation wird unter CC0-Lizenz (Public Domain) veröffentlicht.',
                'version_from': 'Version vom',
                'showref': 'Bildbezüge anzeigen',
                'showrefdefault': 'Standard',
                'showrefnever': 'Nie',
                'showrefalways': 'Immer',
                'metadata': 'Metadaten',
                'zones': 'Zonen',
		'purl': 'Annotation: Persistente URL',
                'edit_zones': 'Zonen editieren',
        },
	'en': {
		'Annotationen': 'Annotations',
                'Anmelden': 'Login',
                'Neue Annotation': 'New annotation',
                'open_all': 'Open all',
                'close': 'Close',
                'close_all': 'Close all',
                'sort': 'Sort',
                'edit': 'Edit',
                'comment': 'Comment',
                'commenttarget': 'Comment on',
                'reply': 'Reply',
                'comments': 'Comments',
                'previous': 'Previous versions',
                'sortdate': 'by time (ascending)',
                'sortdatereverse': 'by time (descending)',
                'sorttitle': 'by title',
                'save': 'Save',
                'cancel': 'Cancel',
                'edit_headline': 'Annotation Editor',
                'annofield_title': 'Title (required)',
                'annofield_link': 'Link (URL)',
                'annofield_linktitle': 'Link title',
                'license': 'Annotation is published under CC0 license (Public Domain)',
                'license_comment': 'Comment is published under CC0 license (Public Domain)',
                'version_from': 'Version vom',
                'showref': 'Bildbezüge anzeigen',
                'showrefdefault': 'mouseover',
                'showrefnever': 'never',
                'showrefalways': 'always',
                'metadata': 'Metadata',
                'zones': 'Zones',
		'purl': 'Annotation: Persistent URL',
                'edit_zones': 'Edit zones',
	}
};

anno_langcode ={
	'en': 'en',
	'eng': 'en'
};

defaultlang = 'de';

function anno_l10n_text(lang,text) {
	var ret = ''
	if (typeof(anno_langcode[lang]) != 'undefined') {lang = anno_langcode[lang]}
 	else {lang = defaultlang}
	if (typeof(anno_localizations[lang]) != 'undefined') {
		if (typeof(anno_localizations[lang][text]) != 'undefined') {
			return anno_localizations[lang][text];
		}
	}
	if (typeof(anno_localizations[defaultlang]) != 'undefined') {
		if (typeof(anno_localizations[defaultlang][text]) != 'undefined') {
			return anno_localizations[defaultlang][text];
		}
	}
	return text;
}
