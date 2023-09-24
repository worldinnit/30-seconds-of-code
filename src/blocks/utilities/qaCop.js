import path from 'path';
import fs from 'fs';
import pathSettings from '#settings/paths';
import { convertToSeoSlug, stripMarkdownFormat } from '#utils';
import { TextParser } from '#blocks/extractor/textParser';
import { Logger } from '#blocks/utilities/logger';

const mdCodeFence = '```';

// TODO: Create an annotations JSON file to then use to annotate
// Syntax here: https://docs.github.com/en/free-pro-team@latest/rest/checks/runs?apiVersion=2022-11-28#create-a-check-run
//  Under output.annotations
// TODO: Use annotations action to upload annotations
// Marketplace action here: https://github.com/marketplace/actions/annotate-action
// TODO: Split each check into its individual method, probably exit with 1 if any check fails but run the entire thing
// TODO: Create a dummy file and test it thoroughly
// TODO: Check with the dummy file on GitHub in a PR
export class QaCop {
  static check = async files => {
    const { rawContentPath: contentDir } = pathSettings;

    return Promise.all(
      ...files.map(file => {
        const { rawAttributes, dateModified, filePath, excerpt, body, tags } =
          TextParser.fromPath(file, true);

        // Check existence of all mandatory metadata keys
        const mandatoryKeys = [
          'title',
          'type',
          'language',
          'tags',
          'cover',
          'dateModified',
        ];
        const missingKeys = mandatoryKeys.filter(
          key => !(key in rawAttributes)
        );
        if (missingKeys.length > 0) {
          Logger.error(
            `Missing mandatory metadata keys in ${file}: ${missingKeys.join(
              ', '
            )}`
          );
        }

        // Check date
        if (
          dateModified.match(/\d{4}-\d{2}-\d{2}/) === null ||
          isNaN(dateModified)
        ) {
          Logger.error(
            `Invalid dateModified value or format in ${file}: ${rawAttributes.dateModified}`
          );
        }

        // Check SEO friendlines of parsed filePath (kebab-case slug)
        const slug = `/${filePath
          .replace(`${contentDir}/snippets/`, '')
          .slice(0, -3)}`;
        const correctSlug = convertToSeoSlug(slug);

        if (slug !== correctSlug) {
          Logger.error(
            `Invalid SEO slug in ${file}: ${slug} - Suggested slug: ${correctSlug}`
          );
        }

        // Check if cover image exists
        const coverPath = path.join(
          contentDir,
          'assets',
          'cover',
          `${rawAttributes.cover}.jpg`
        );

        if (!fs.existsSync(coverPath)) {
          Logger.error(`Cover image not found in ${file}: ${coverPath}`);
        }

        // Check length of short description
        const bodyText = body
          .slice(0, body.indexOf(mdCodeFence))
          .replace(/\r\n/g, '\n');
        const shortText =
          excerpt && excerpt.trim()
            ? excerpt
            : bodyText.slice(0, bodyText.indexOf('\n\n'));
        const seoDescription = stripMarkdownFormat(shortText);

        if (seoDescription.length > 140) {
          Logger.error(`Long description in ${file}: ${seoDescription}`);
        }

        // Check at least one tag is present
        if (tags.length === 0) {
          Logger.error(`No tags found in ${file}`);
        }
      })
    );
  };
}
