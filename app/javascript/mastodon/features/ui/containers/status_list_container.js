import { createSelector } from '@reduxjs/toolkit';
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import { connect } from 'react-redux';

import { debounce } from 'lodash';

import { scrollTopTimeline, loadPending } from '../../../actions/timelines';
import StatusList from '../../../components/status_list';
import { me } from '../../../initial_state';

const makeGetStatusIds = (pending = false) => createSelector([
  (state, { type }) => state.getIn(['settings', type.split(':')[0]], ImmutableMap()),
  (state, { type }) => state.getIn(['timelines', type, pending ? 'pendingItems' : 'items'], ImmutableList()),
  (state, { column }) => {
    const columns = state.getIn(['settings', 'columns']);
    const index   = columns.findIndex(c => c.get('uuid') === column);
    return [column, index, columns.get(index)];
  },
  (state)           => state.get('statuses'),
], (timelineSettings, statusIds, [ column, columnIndex, columnSettings ], statuses) => {
  const showsSettings =
    (column && columnIndex > 0)
    ? columnSettings.getIn(['params', 'shows'], ImmutableMap())
    : timelineSettings.get('shows', ImmutableMap());

  return statusIds.filter(id => {
    if (id === null || id === 'inline-follow-suggestions') return true;

    const statusForId = statuses.get(id);
    let showStatus    = true;

    if (statusForId.get('account') === me) return true;

    if (timelineSettings.getIn(['shows', 'reblog']) === false) {
      showStatus = showStatus && statusForId.get('reblog') === null;
    }

    if (timelineSettings.getIn(['shows', 'reply']) === false) {
      showStatus = showStatus && (statusForId.get('in_reply_to_id') === null || statusForId.get('in_reply_to_account_id') === me);
    }

    if (showsSettings.get('hideBots') === true) {
      showStatus = showStatus && !statusForId.get('bot');
    }

    return showStatus;
  });
});

const makeMapStateToProps = () => {
  const getStatusIds = makeGetStatusIds();
  const getPendingStatusIds = makeGetStatusIds(true);

  const mapStateToProps = (state, { timelineId, columnId }) => ({
    statusIds: getStatusIds(state, { type: timelineId, column: columnId }),
    lastId:    state.getIn(['timelines', timelineId, 'items'])?.last(),
    isLoading: state.getIn(['timelines', timelineId, 'isLoading'], true),
    isPartial: state.getIn(['timelines', timelineId, 'isPartial'], false),
    hasMore:   state.getIn(['timelines', timelineId, 'hasMore']),
    numPending: getPendingStatusIds(state, { type: timelineId, column: columnId }).size,
  });

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { timelineId }) => ({

  onScrollToTop: debounce(() => {
    dispatch(scrollTopTimeline(timelineId, true));
  }, 100),

  onScroll: debounce(() => {
    dispatch(scrollTopTimeline(timelineId, false));
  }, 100),

  onLoadPending: () => dispatch(loadPending(timelineId)),

});

export default connect(makeMapStateToProps, mapDispatchToProps)(StatusList);
