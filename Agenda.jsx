var getDateKey = function (date) {
	return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

window.Agenda = React.createClass({
	ieMouseMove: function (e) {
		//ie9 only supports dragdrop on anchors and imgs, but we can trigger it manually.
		if (e.target.dragDrop && window.event.button == 1)
			e.target.dragDrop();
	},
	eventDragStart: function(agendaEvent,DOMEvent){
		DOMEvent.dataTransfer.effectAllowed = "move";
		DOMEvent.dataTransfer.setData("text", '' + agendaEvent.id);
	},
	dragOver: function(e){
		e.preventDefault();
	},
	drop: function (start, DOMEvent) {
		var eventId = DOMEvent.dataTransfer.getData("text");
		var event = (this.props.events || []).filter(function (event) {
			return event.id + '' === eventId;
		})[0];
		if (this.props.eventDrop)
			this.props.eventDrop(start, event);
	},
	renderEvent: function(e){
		return (
			<div className="agenda__event" title={e.title} draggable="true" onDragStart={this.eventDragStart.bind(null,e)} onMouseMove={this.ieMouseMove}>
				<span>{e.title}</span>
			</div>
		)
	},
	renderRowDate: function(col){
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
		var eventsByDate = (this.props.events || []).reduce(function (accumulated, current) {
			var key = getDateKey(current.start);
			if (!accumulated[key])
				accumulated[key] = [];
			accumulated[key].push(current);
			return accumulated;
		}, {});

		var now = new Date();
		var dates = [];
		for (var i = 0; i < 3; i++)
			dates.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));

		var rows = [];
		for (var i = 0; i <= 48; i++) {
			var hour = Math.floor(i / 2); 
			var minutes = i % 2 * 30;
			var row = {
				step: i,
				hour: hour,
				minutes: minutes,
				cols: dates.map(function (date) {
					var events = eventsByDate[getDateKey(date)];
					var spanStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour,minutes);
					var spanEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour,minutes + 30 /*step diff*/);
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
						{dates.map(function(date){ return <div className="agenda__cell">{date.toString()}</div>;})}
					</div>
					{rows.map(this.renderRow)}
				</div>
			</div>
		);
	}
});