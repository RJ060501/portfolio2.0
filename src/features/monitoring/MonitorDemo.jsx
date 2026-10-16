'use client';

import { useState } from 'react';
import { sampleEvents } from './data';
export default function MonitorDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [reviewedIds, setReviewedIds] = useState([]);
  const selectedEvent = sampleEvents[selectedIndex];
  return (
    <div className="demo monitorDemo">
      <div className="demobar">
        <span>◈ &nbsp; Event triage</span>
        <span className="demobadge">SYNTHETIC DATA</span>
      </div>
      <div className="demostats">
        <div>
          <strong>{sampleEvents.length}</strong>
          <span>Sample events</span>
        </div>
        <div>
          <strong>{sampleEvents.length - reviewedIds.length}</strong>
          <span>Awaiting review</span>
        </div>
        <div>
          <strong>{reviewedIds.length}</strong>
          <span>Reviewed locally</span>
        </div>
      </div>
      <div className="demofilter">
        <label htmlFor="severity">Severity</label>
        <select id="severity" value={filter} onChange={(value) => setFilter(value.target.value)}>
          {['All', 'High', 'Medium', 'Low'].map((event) => (
            <option key={event}>{event}</option>
          ))}
        </select>
        <button
          className="textbutton"
          onClick={() => {
            setReviewedIds([]);
            setFilter('All');
            setSelectedIndex(0);
          }}
        >
          Reset demo
        </button>
      </div>
      <div className="triagegrid">
        <div className="eventlist">
          {sampleEvents.map(
            (event, index) =>
              (filter === 'All' || filter === event.severity) && (
                <button
                  className={selectedIndex === index ? 'event active' : 'event'}
                  key={event.id}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span>
                    <small className={'severity ' + event.severity.toLowerCase()}>
                      {event.severity}
                    </small>
                    <small>{event.time}</small>
                  </span>
                  <strong>{event.type}</strong>
                  <small>{event.user}</small>
                  <span className="eventbottom">
                    {event.id}
                    <span>{reviewedIds.includes(event.id) ? 'Reviewed ✓' : 'Review →'}</span>
                  </span>
                </button>
              ),
          )}
        </div>
        <div className="eventdetail" aria-live="polite">
          <div className="eyebrow">INVESTIGATION / {selectedEvent.id}</div>
          <h3>{selectedEvent.type}</h3>
          <p>{selectedEvent.detail}</p>
          <h4>Suggested checks</h4>
          <ol>
            {selectedEvent.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <button
            className="button primary"
            disabled={reviewedIds.includes(selectedEvent.id)}
            onClick={() => setReviewedIds((value) => [...value, selectedEvent.id])}
          >
            {reviewedIds.includes(selectedEvent.id) ? 'Marked reviewed ✓' : 'Mark reviewed'}
          </button>
          <small>Demo state resets when you leave. No account actions are performed.</small>
        </div>
      </div>
    </div>
  );
}
