var getDateKey = function (date) {
	return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

var getDefaultProps = function () {
	return {
		start: new Date(),
		noOfDays: 3,
		snapDuration: 30
	}
}
var mergeProps = function (onto, from) {
	for (var prop in from)
		if (from.hasOwnProperty(prop))
			onto[prop] = from[prop];

	return onto;
}

window.Agenda = React.createClass({
	ieMouseMove: function (e) {
		//ie9 only supports dragdrop on anchors and imgs, but we can trigger it manually.
		if (e.target.dragDrop && window.event.button == 1)
			e.target.dragDrop();
	},
	eventDragStart: function (agendaEvent, DOMEvent) {
		DOMEvent.dataTransfer.effectAllowed = "move";
		DOMEvent.dataTransfer.setData("text", '' + agendaEvent.id);
	},
	dragOver: function (e) {
		e.preventDefault();
	},
	drop: function (start, DOMEvent) {
		var eventId = DOMEvent.dataTransfer.getData("text");
		var event = (this.props.events || []).filter(function (event) {
			return event.id + '' === eventId;
		})[0];
		if (this.props.eventDrop)
			this.props.eventDrop(start, event);
		else {
			//Default to mutate the original event object and rerender
			event.start = start;
			this.forceUpdate();
		}
	},
	renderEvent: function (e) {
		return (
			<div key={e.id} className="agenda__event" title={e.title} draggable="true" onDragStart={this.eventDragStart.bind(null,e)} onMouseMove={this.ieMouseMove}>
				<span>{e.title}</span>
			</div>
		)
	},
	renderRowDate: function (col) {
		return (
			<div key={col.start.toString()} className="agenda__cell agenda__cell--date" onDragOver={this.dragOver} onDrop={this.drop.bind(null,col.start)}>
				{col.events.map(this.renderEvent)}
			</div>
		)
	},
	renderRow: function (row) {
		return (
			<div key={row.step} className="agenda__row">
				{this.renderStepHeader(row)}
				{row.cols.map(this.renderRowDate)}
			</div>
		)
	},
	renderStepHeader: function (row) {
		return (
			<div key={row.step} className="agenda__cell agenda__cell--step">
				{row.hour + ':' + row.minutes}
			</div>
		)
	},
	render: function () {

		var props = mergeProps(getDefaultProps(), this.props);

		var eventsByDate = (this.props.events || []).reduce(function (accumulated, current) {
			var key = getDateKey(current.start);
			if (!accumulated[key])
				accumulated[key] = [];
			accumulated[key].push(current);
			return accumulated;
		}, {});

		var dates = [];
		for (var i = 0; i < props.noOfDays; i++)
			dates.push(new Date(props.start.getFullYear(), props.start.getMonth(), props.start.getDate() + i));

		var rows = [];
		var noOfSnaps = 24 * 60 / props.snapDuration; //Hours in a day * minutes in an hour / snapDuration in minutes
		for (var i = 0; i < noOfSnaps; i++) { //Not <= since the last snap would be the first in the next day
			var hour = Math.floor(i / (60 / props.snapDuration)); //snap / 60 minutes in an hour / snapDuration in minutes
			var minutes = i % (60 / props.snapDuration) * props.snapDuration;
			var row = {
				step: i,
				hour: hour,
				minutes: minutes,
				cols: dates.map(function (date) {
					var events = eventsByDate[getDateKey(date)];
					var spanStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minutes);
					var spanEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minutes + props.snapDuration /*step diff*/);
					return {
						start: spanStart,
						events: (events || []).filter(function (e) {
							return e.start >= spanStart && e.start < spanEnd;
						})
					}
				})
			};
			rows.push(row);
		}

		return (
			<div className="agenda">
				<h1>Agenda</h1>
				<div style={{display: 'table'}}>
					<div className="agenda__row">
						<div className="agenda__cell"></div>
						{dates.map(function(date){ return <div key={date.toString()} className="agenda__cell">{date.toString()}</div>;})}
					</div>
					{rows.map(this.renderRow)}
				</div>
			</div>
		);
	}
});