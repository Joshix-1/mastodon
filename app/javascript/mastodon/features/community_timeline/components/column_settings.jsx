import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { injectIntl, FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';

import SettingToggle from '../../notifications/components/setting_toggle';

class ColumnSettings extends PureComponent {

  static propTypes = {
    settings: ImmutablePropTypes.map.isRequired,
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
  };

  render () {
    const { settings, onChange } = this.props;

    return (
      <div className='column-settings'>
        <section>
          <div className='column-settings__row'>
            <SettingToggle settings={settings} settingPath={['other', 'onlyMedia']} onChange={onChange} label={<FormattedMessage id='community.column_settings.media_only' defaultMessage='Media only' />} />
            <SettingToggle settings={settings} settingPath={['shows', 'hideBots']} onChange={onChange} label={<FormattedMessage id='community.column_settings.hide_bots' defaultMessage='Hide bot posts' />} />
            <SettingToggle settings={settings} settingPath={['shows', 'hideSensitiveBots']} onChange={onChange} label={<FormattedMessage id='community.column_settings.hide_sensitive_bots' defaultMessage='Hide sensitive bot posts' />} />
          </div>
        </section>
      </div>
    );
  }

}

export default injectIntl(ColumnSettings);
